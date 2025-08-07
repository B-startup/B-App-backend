import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateVideoDto, UpdateVideoDto, VideoResponseDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async create(createVideoDto: CreateVideoDto): Promise<VideoResponseDto> {
        // Vérifier que le projet existe
        const project = await this.prisma.project.findUnique({
            where: { id: createVideoDto.projectId }
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${createVideoDto.projectId} not found`);
        }

        const video = await this.prisma.video.create({
            data: {
                title: createVideoDto.title,
                description: createVideoDto.description,
                projectId: createVideoDto.projectId,
                duration: createVideoDto.duration,
                thumbnailUrl: createVideoDto.thumbnailUrl,
                videoUrl: '',
                filePath: '',
                fileSize: 0,
                mimeType: 'video/mp4'
            }
        });

        return this.mapToResponse(video);
    }

    async uploadVideo(file: Express.Multer.File, uploadData: any): Promise<VideoResponseDto> {
        const { title, description, projectId } = uploadData;

        // Vérifier que le projet existe
        const project = await this.prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${projectId} not found`);
        }

        if (!file) {
            throw new BadRequestException('No video file provided');
        }

        // Générer le chemin de fichier
        const uploadDir = this.configService.get<string>('PROJECT_VIDEOS_DIR');
        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Sauvegarder le fichier
        fs.writeFileSync(filePath, file.buffer);

        // Créer l'entrée dans la base de données
        const video = await this.prisma.video.create({
            data: {
                title,
                description,
                projectId,
                videoUrl: `${this.configService.get<string>('BASE_URL')}${filePath}`,
                filePath,
                fileSize: file.size,
                mimeType: file.mimetype
            }
        });

        return this.mapToResponse(video);
    }

    async findAll(): Promise<VideoResponseDto[]> {
        const videos = await this.prisma.video.findMany({
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

    async findByProject(projectId: string): Promise<VideoResponseDto[]> {
        const videos = await this.prisma.video.findMany({
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

    async findOne(id: string): Promise<VideoResponseDto> {
        const video = await this.prisma.video.findUnique({
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

    async update(id: string, updateVideoDto: UpdateVideoDto): Promise<VideoResponseDto> {
        const existingVideo = await this.prisma.video.findUnique({
            where: { id }
        });

        if (!existingVideo) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }

        // Si projectId est fourni, vérifier qu'il existe
        if (updateVideoDto.projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: updateVideoDto.projectId }
            });

            if (!project) {
                throw new NotFoundException(`Project with ID ${updateVideoDto.projectId} not found`);
            }
        }

        const updatedVideo = await this.prisma.video.update({
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

    async remove(id: string): Promise<void> {
        const video = await this.prisma.video.findUnique({
            where: { id }
        });

        if (!video) {
            throw new NotFoundException(`Video with ID ${id} not found`);
        }

        // Supprimer le fichier physique s'il existe
        if (video.filePath && fs.existsSync(video.filePath)) {
            fs.unlinkSync(video.filePath);
        }

        await this.prisma.video.delete({
            where: { id }
        });
    }

    async countByProject(projectId: string): Promise<number> {
        return this.prisma.video.count({
            where: { projectId }
        });
    }

    private mapToResponse(video: any): VideoResponseDto {
        return {
            id: video.id,
            title: video.title,
            description: video.description,
            projectId: video.projectId,
            videoUrl: video.videoUrl,
            filePath: video.filePath,
            fileSize: video.fileSize,
            mimeType: video.mimeType,
            duration: video.duration,
            thumbnailUrl: video.thumbnailUrl,
            createdAt: video.createdAt,
            updatedAt: video.updatedAt
        };
    }
}
