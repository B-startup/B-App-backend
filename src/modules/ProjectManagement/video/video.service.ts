import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Video } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { ConfigService } from '@nestjs/config';
import { CreateVideoDto, UpdateVideoDto, VideoResponseDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';
import { getVideoDurationInSeconds } from 'get-video-duration';

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
    ) {
        super(prismaService);
    }

    // ==================== OVERRIDES WITH BUSINESS LOGIC ====================

    async remove(id: string): Promise<Video> {
        const video = await this.findOneOrFail(id);

        // Supprimer le fichier physique s'il existe
        if (video.videoUrl) {
            await this.deleteVideoFile(video.videoUrl);
        }

        return super.remove(id);
    }

    private async deleteVideoFile(videoUrl: string): Promise<void> {
        try {
            console.log(`🗑️ Attempting to delete video file from URL: ${videoUrl}`);
            
            const filePath = this.extractFilePath(videoUrl);
            console.log(`🗃️ Final computed file path: ${filePath}`);
            
            await this.removeFileIfExists(filePath);
        } catch (error) {
            console.warn(`⚠️ Could not delete video file: ${error.message}`);
        }
    }

    private extractFilePath(videoUrl: string): string {
        const url = new URL(videoUrl);
        const relativePath = url.pathname;
        
        // IMPORTANT: Décoder l'URL pour convertir %20 en espaces, etc.
        const decodedPath = decodeURIComponent(relativePath);
        console.log(`🔄 Decoded path: ${decodedPath}`);
        
        // Construire le chemin absolu du fichier
        return path.join(process.cwd(), decodedPath.substring(1)); // Enlever le premier "/"
    }

    private async removeFileIfExists(filePath: string): Promise<void> {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ Video file deleted successfully: ${filePath}`);
            
            await this.cleanupEmptyDirectory(filePath);
        } else {
            console.warn(`⚠️ Video file not found at path: ${filePath}`);
            this.debugMissingFile(filePath);
        }
    }

    private async cleanupEmptyDirectory(filePath: string): Promise<void> {
        try {
            const parentDir = path.dirname(filePath);
            const files = fs.readdirSync(parentDir);
            if (files.length === 0) {
                fs.rmdirSync(parentDir);
                console.log(`📁 Empty directory deleted: ${parentDir}`);
            }
        } catch (dirError) {
            console.warn(`⚠️ Could not check/delete parent directory: ${dirError.message}`);
        }
    }

    private debugMissingFile(filePath: string): void {
        try {
            const parentDir = path.dirname(filePath);
            if (fs.existsSync(parentDir)) {
                const files = fs.readdirSync(parentDir);
                console.log(`📂 Files in directory ${parentDir}:`);
                files.forEach(file => console.log(`   - ${file}`));
            } else {
                console.log(`📂 Directory does not exist: ${parentDir}`);
            }
        } catch (debugError) {
            console.warn(`🔍 Debug listing failed: ${debugError.message}`);
        }
    }

    // ==================== COMPLEX BUSINESS LOGIC METHODS ====================

    /**
     * Analyser la durée d'une vidéo en utilisant get-video-duration (JavaScript pur)
     */
    private async analyzeVideoDuration(filePath: string): Promise<number> {
        try {
            console.log(`Analyzing video duration for: ${filePath}`);
            
            // Utiliser get-video-duration qui ne nécessite pas FFmpeg
            const duration = await getVideoDurationInSeconds(filePath);
            
            if (duration && typeof duration === 'number' && duration > 0) {
                const roundedDuration = Math.round(duration);
                console.log(`Video duration analyzed: ${roundedDuration} seconds`);
                return roundedDuration;
            } else {
                console.warn('No valid duration found in video metadata');
                return 0; // Durée par défaut si non trouvée
            }
        } catch (error) {
            console.error('Error analyzing video duration:', error);
            console.warn('Falling back to default duration (0 seconds)');
            return 0; // Durée par défaut en cas d'erreur
        }
    }

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

        // Générer le chemin de fichier organisé par projet
        const uploadDir = path.join(
            this.configService.get<string>('PROJECT_VIDEOS_DIR', 'uploads/ProjectVideos'),
            projectId
        );
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        try {
            // Créer le dossier s'il n'existe pas
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Sauvegarder le fichier
            fs.writeFileSync(filePath, file.buffer);

            // Analyser la durée de la vidéo
            console.log(`Analyzing video duration for: ${filePath}`);
            const duration = await this.analyzeVideoDuration(filePath);
            console.log(`Video duration analyzed: ${duration} seconds`);

            // Créer l'URL complète pour l'accès public
            const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:8050');
            const videoUrl = `${baseUrl}uploads/ProjectVideos/${projectId}/${fileName}`;

            // Créer l'entrée dans la base de données avec userId et durée analysée
            const video = await this.model.create({
                data: {
                    title: title || path.parse(file.originalname).name, // Utiliser nom du fichier si pas de titre
                    description: description || '',
                    projectId,
                    userId, // Stocker l'ID de l'utilisateur depuis le token
                    duration, // Durée en secondes analysée automatiquement
                    videoUrl, // URL complète pour accès direct au fichier
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

            console.log(`Video uploaded successfully: ${video.id}, duration: ${duration}s, user: ${userId}`);
            return this.mapToResponse(video);

        } catch (error) {
            // Nettoyer le fichier en cas d'erreur
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }

            console.error('Error uploading video:', error);
            throw new BadRequestException('Failed to upload and process video file');
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
     * Mettre à jour une vidéo avec possibilité de remplacer le fichier
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

        // Si un nouveau fichier est fourni, traiter le remplacement
        if (newFile) {
            videoData = await this.processFileReplacement(existingVideo, updateVideoDto.projectId, newFile);
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
     * Traiter le remplacement du fichier vidéo
     */
    private async processFileReplacement(
        existingVideo: any,
        newProjectId: string | undefined,
        newFile: Express.Multer.File
    ): Promise<{ videoUrl: string; duration: number; fileSize: number; mimeType: string }> {
        // Valider le nouveau fichier
        this.validateVideoFile(newFile);

        const projectId = newProjectId || existingVideo.projectId;
        const { filePath: newFilePath, videoUrl } = this.generateVideoFilePaths(projectId, newFile.originalname);

        try {
            // 1. Sauvegarder le nouveau fichier
            await this.saveNewVideoFile(newFilePath, newFile);
            console.log(`📹 New video file saved: ${newFilePath}`);
            
            // 2. Analyser la durée du nouveau fichier
            const duration = await this.analyzeVideoDuration(newFilePath);
            
            // 3. Supprimer l'ancien fichier APRÈS avoir confirmé que le nouveau est sauvegardé
            console.log(`🗑️ Deleting old video file for video ID: ${existingVideo.id}`);
            await this.deleteOldVideoFile(existingVideo.videoUrl);

            console.log(`✅ Video file replaced successfully: ${existingVideo.id}, new duration: ${duration}s`);

            return {
                videoUrl,
                duration,
                fileSize: newFile.size,
                mimeType: newFile.mimetype
            };

        } catch (error) {
            // Nettoyer le nouveau fichier en cas d'erreur
            if (fs.existsSync(newFilePath)) {
                fs.unlinkSync(newFilePath);
                console.log(`🧹 Cleaned up new file due to error: ${newFilePath}`);
            }
            throw new BadRequestException(`Failed to replace video file: ${error.message}`);
        }
    }

    /**
     * Générer les chemins pour le nouveau fichier vidéo
     */
    private generateVideoFilePaths(projectId: string, originalName: string): { filePath: string; videoUrl: string } {
        const uploadDir = path.join(
            this.configService.get<string>('PROJECT_VIDEOS_DIR', 'uploads/ProjectVideos'),
            projectId
        );
        const fileName = `${Date.now()}-${originalName}`;
        const filePath = path.join(uploadDir, fileName);
        
        const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:8050');
        const videoUrl = `${baseUrl}uploads/ProjectVideos/${projectId}/${fileName}`;

        return { filePath, videoUrl };
    }

    /**
     * Sauvegarder le nouveau fichier vidéo
     */
    private async saveNewVideoFile(filePath: string, file: Express.Multer.File): Promise<void> {
        const uploadDir = path.dirname(filePath);
        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        fs.writeFileSync(filePath, file.buffer);
    }

    /**
     * Supprimer l'ancien fichier vidéo
     */
    private async deleteOldVideoFile(videoUrl: string): Promise<void> {
        if (!videoUrl) return;

        try {
            console.log(`🗑️ Attempting to delete old video file from URL: ${videoUrl}`);
            
            // Extraire le chemin depuis l'URL
            const url = new URL(videoUrl);
            const relativePath = url.pathname; // Ex: /uploads/ProjectVideos/projectId/filename.mp4
            
            // IMPORTANT: Décoder l'URL pour convertir %20 en espaces, etc.
            const decodedPath = decodeURIComponent(relativePath);
            console.log(`🔄 Decoded path: ${decodedPath}`);
            
            // Construire le chemin absolu du fichier
            const oldFilePath = path.join(process.cwd(), decodedPath.substring(1)); // Enlever le premier "/"
            
            console.log(`🗃️ Final computed file path: ${oldFilePath}`);
            
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(`✅ Old video file deleted successfully: ${oldFilePath}`);
                
                // Optionnel: Vérifier si le dossier parent est vide et le supprimer
                const parentDir = path.dirname(oldFilePath);
                try {
                    const files = fs.readdirSync(parentDir);
                    if (files.length === 0) {
                        fs.rmdirSync(parentDir);
                        console.log(`📁 Empty directory deleted: ${parentDir}`);
                    }
                } catch (dirError) {
                    console.warn(`⚠️ Could not check/delete parent directory: ${dirError.message}`);
                }
            } else {
                console.warn(`⚠️ Old video file not found at path: ${oldFilePath}`);
                
                // Debugging: Lister les fichiers dans le dossier pour voir ce qui existe réellement
                try {
                    const parentDir = path.dirname(oldFilePath);
                    if (fs.existsSync(parentDir)) {
                        const files = fs.readdirSync(parentDir);
                        console.log(`📂 Files in directory ${parentDir}:`);
                        files.forEach(file => console.log(`   - ${file}`));
                    } else {
                        console.log(`📂 Directory does not exist: ${parentDir}`);
                    }
                } catch (debugError) {
                    console.warn(`🔍 Debug listing failed: ${debugError.message}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error deleting old video file from ${videoUrl}:`, error.message);
            // Ne pas lancer d'erreur critique, juste un avertissement pour continuer le processus
            console.warn(`⚠️ Continuing despite deletion failure...`);
        }
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
