import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Video } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { ConfigService } from '@nestjs/config';
import { CreateVideoDto, UpdateVideoDto, VideoResponseDto } from './dto';

@Injectable()
export class VideoService extends BaseCrudServiceImpl<
    Video,
    CreateVideoDto,
    UpdateVideoDto
> {
    protected model = this.prismaService.video;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly configService: ConfigService,
        private readonly cloudinaryService: CloudinaryService
    ) {
        super(prismaService);
    }

    // ==================== OVERRIDES WITH BUSINESS LOGIC ====================

    async remove(id: string): Promise<Video> {
        const video = await this.findOneOrFail(id);

        console.log('🗑️  Suppression de la vidéo:', id);
        console.log('📹 URL de la vidéo:', video.videoUrl || 'Aucune');

        // Supprimer la vidéo de Cloudinary s'il existe
        if (video.videoUrl) {
            try {
                if (this.isCloudinaryUrl(video.videoUrl)) {
                    console.log('☁️  Suppression de la vidéo Cloudinary...');
                    const publicId = this.cloudinaryService.extractPublicIdFromUrl(video.videoUrl);
                    if (publicId) {
                        await this.cloudinaryService.deleteFile(publicId, 'video');
                        console.log('✅ Vidéo Cloudinary supprimée avec succès');
                    }
                } else {
                    // Ancienne vidéo locale - log uniquement
                    console.warn('⚠️  Vidéo locale détectée mais non supprimée (migration Cloudinary requise):', video.videoUrl);
                }
            } catch (error) {
                console.warn(`❌ Erreur lors de la suppression de la vidéo: ${video.videoUrl}`, error);
            }
        }

        const deletedVideo = await super.remove(id);
        console.log('✅ Vidéo supprimée avec succès:', id);
        return deletedVideo;
    }



    // ==================== COMPLEX BUSINESS LOGIC METHODS ====================



    /**
     * Valider le fichier vidéo
     */
    private validateVideoFile(file: Express.Multer.File): void {
        const allowedMimeTypes = [
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/flv',
            'video/webm',
            'video/mkv'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid video format. Allowed formats: ${allowedMimeTypes.join(', ')}`
            );
        }

        // Limite de taille : 100MB
        const maxSize = 100 * 1024 * 1024; // 100MB en bytes
        if (file.size > maxSize) {
            throw new BadRequestException(
                `Video file too large. Maximum size is ${maxSize / 1024 / 1024}MB`
            );
        }
    }

    async uploadVideo(file: Express.Multer.File, uploadData: any, userId: string): Promise<VideoResponseDto> {
        const { title, description, projectId } = uploadData;

        // Vérifier que le projet existe
        const project = await this.prismaService.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        if (!file) {
            throw new BadRequestException('No video file provided');
        }

        // Valider le fichier vidéo
        this.validateVideoFile(file);

        try {
            console.log('☁️  Upload de la vidéo vers Cloudinary...');
            // Upload vers Cloudinary
            const cloudinaryResult = await this.cloudinaryService.uploadVideo(
                file, 
                projectId, 
                project.creatorId
            );
            
            console.log('✅ Vidéo uploadée avec succès:', cloudinaryResult.secure_url);

            // Créer l'entrée dans la base de données
            const video = await this.model.create({
                data: {
                    title: title || file.originalname.split('.')[0], // Utiliser nom du fichier si pas de titre
                    description: description || '',
                    projectId,
                    userId, // Stocker l'ID de l'utilisateur depuis le token
                    duration: cloudinaryResult.duration || 0, // Durée depuis Cloudinary ou 0 par défaut
                    videoUrl: cloudinaryResult.secure_url, // URL Cloudinary
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    thumbnailUrl: null // Pour l'instant, pas de génération de thumbnail
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });

            console.log(`Vidéo uploadée avec succès: ${video.id}, durée: ${cloudinaryResult.duration || 0}s, utilisateur: ${userId}`);
            return this.mapToResponse(video);

        } catch (error) {
            console.error('❌ Erreur lors de l\'upload vers Cloudinary:', error);
            
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException('Erreur lors de l\'upload et du traitement de la vidéo vers Cloudinary');
        }
    }

    async updateWithValidation(id: string, updateVideoDto: UpdateVideoDto): Promise<VideoResponseDto> {
        // Vérifier que la vidéo existe
        await this.findOneOrFail(id);

        // Si projectId est fourni, vérifier qu'il existe
        if (updateVideoDto.projectId) {
            const project = await this.prismaService.project.findUnique({
                where: { id: updateVideoDto.projectId }
            });

            if (!project) {
                throw new NotFoundException(`Project with ID ${updateVideoDto.projectId} not found`);
            }
        }

        const updatedVideo = await this.model.update({
            where: { id },
            data: {
                title: updateVideoDto.title,
                description: updateVideoDto.description,
                projectId: updateVideoDto.projectId,
                duration: updateVideoDto.duration,
                thumbnailUrl: updateVideoDto.thumbnailUrl
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return this.mapToResponse(updatedVideo);
    }

    /**
     * Mettre à jour une vidéo avec possibilité de remplacer le fichier (Cloudinary version)
     */
    async updateWithFileReplacement(
        id: string, 
        updateVideoDto: UpdateVideoDto, 
        newFile?: Express.Multer.File,
        userId?: string
    ): Promise<VideoResponseDto> {
        const existingVideo = await this.findOneOrFail(id);

        // Valider le projet si fourni
        await this.validateProjectIfProvided(updateVideoDto.projectId);

        let videoData = {
            videoUrl: existingVideo.videoUrl,
            duration: updateVideoDto.duration || existingVideo.duration,
            fileSize: existingVideo.fileSize,
            mimeType: existingVideo.mimeType
        };

        // Si un nouveau fichier est fourni, traiter le remplacement via Cloudinary
        if (newFile) {
            try {
                // Valider le nouveau fichier
                this.validateVideoFile(newFile);

                const projectId = updateVideoDto.projectId || existingVideo.projectId;
                
                // Récupérer les détails du projet pour le creatorId
                const project = await this.prismaService.project.findUnique({
                    where: { id: projectId }
                });

                if (!project) {
                    throw new NotFoundException(`Project with ID ${projectId} not found`);
                }

                console.log('☁️  Remplacement de la vidéo via Cloudinary...');
                
                // Upload du nouveau fichier vers Cloudinary
                const cloudinaryResult = await this.cloudinaryService.uploadVideo(
                    newFile, 
                    projectId, 
                    project.creatorId
                );
                
                console.log('✅ Nouvelle vidéo uploadée:', cloudinaryResult.secure_url);
                
                // Supprimer l'ancienne vidéo de Cloudinary si elle existe
                if (existingVideo.videoUrl && this.isCloudinaryUrl(existingVideo.videoUrl)) {
                    try {
                        const publicId = this.cloudinaryService.extractPublicIdFromUrl(existingVideo.videoUrl);
                        if (publicId) {
                            await this.cloudinaryService.deleteFile(publicId, 'video');
                            console.log('✅ Ancienne vidéo Cloudinary supprimée');
                        }
                    } catch (error) {
                        console.warn('⚠️ Erreur lors de la suppression de l\'ancienne vidéo:', error);
                    }
                }

                videoData = {
                    videoUrl: cloudinaryResult.secure_url,
                    duration: cloudinaryResult.duration || 0,
                    fileSize: newFile.size,
                    mimeType: newFile.mimetype
                };

            } catch (error) {
                console.error('❌ Erreur lors du remplacement de la vidéo:', error);
                throw new BadRequestException(`Échec du remplacement de la vidéo: ${error.message}`);
            }
        }

        // Mettre à jour les métadonnées dans la base de données
        const updatedVideo = await this.model.update({
            where: { id },
            data: {
                title: updateVideoDto.title || existingVideo.title,
                description: updateVideoDto.description ?? existingVideo.description,
                projectId: updateVideoDto.projectId || existingVideo.projectId,
                userId: userId || existingVideo.userId,
                duration: videoData.duration,
                thumbnailUrl: updateVideoDto.thumbnailUrl ?? existingVideo.thumbnailUrl,
                videoUrl: videoData.videoUrl,
                fileSize: videoData.fileSize,
                mimeType: videoData.mimeType
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        return this.mapToResponse(updatedVideo);
    }

    /**
     * Valider le projet si un ID est fourni
     */
    private async validateProjectIfProvided(projectId?: string): Promise<void> {
        if (projectId) {
            const project = await this.prismaService.project.findUnique({
                where: { id: projectId }
            });

            if (!project) {
                throw new NotFoundException(`Project with ID ${projectId} not found`);
            }
        }
    }

    /**
     * Vérifie si une URL est une URL Cloudinary
     */
    private isCloudinaryUrl(url: string): boolean {
        return url?.includes('cloudinary.com') ?? false;
    }

    // ==================== HYBRID APPROACH METHODS ====================
    // Optimized methods for simple cases (direct Prisma selection)
    // Complex methods with business logic use DTOs and include relations





    /**
     * Get video with detailed information (complex case)
     */
    async findOneDetailed(id: string) {
        const video = await this.model.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true
                            }
                        }
                    }
                },
                View: {
                    select: {
                        userId: true,
                        timespent: true,
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        View: true
                    }
                }
            }
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        return video;
    }





    // ==================== LEGACY METHODS WITH DTO MAPPING ====================

    async findAllWithDto(): Promise<VideoResponseDto[]> {
        const videos = await this.model.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return videos.map(video => this.mapToResponse(video));
    }

    async findByProjectWithDto(projectId: string): Promise<VideoResponseDto[]> {
        const videos = await this.model.findMany({
            where: { projectId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return videos.map(video => this.mapToResponse(video));
    }

    async findOneWithDto(id: string): Promise<VideoResponseDto> {
        const video = await this.model.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }

        return this.mapToResponse(video);
    }

    // ==================== UTILITY METHODS ====================

    async countByProject(projectId: string): Promise<number> {
        return this.model.count({
            where: { projectId }
        });
    }

    private mapToResponse(video: any): VideoResponseDto {
        return {
            id: video.id,
            title: video.title,
            description: video.description,
            projectId: video.projectId,
            userId: video.userId,
            videoUrl: video.videoUrl,
            fileSize: video.fileSize,
            mimeType: video.mimeType,
            duration: video.duration,
            thumbnailUrl: video.thumbnailUrl,
            nbViews: video.nbViews,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt
        };
    }
}
