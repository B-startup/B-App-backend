import { Injectable } from '@nestjs/common';
import { View } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { CounterService } from '../../../core/common/services/counter.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';

@Injectable()
export class ViewService extends BaseCrudServiceImpl<View, CreateViewDto, UpdateViewDto> {
    protected model: any;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly counterService: CounterService
    ) {
        super(prismaService);
        this.model = this.prismaService.view;
    }

    /**
     * Creates a new view record or updates an existing one
     * Automatically increments the view counter for the video and project
     */
    async create(data: CreateViewDto): Promise<View> {
        // Vérifier si une vue existe déjà pour ce user/video
        const existingView = await this.model.findFirst({
            where: {
                userId: data.userId,
                videoId: data.videoId
            }
        });

        if (existingView) {
            // Si une vue existe déjà, on met à jour le temps passé
            return this.model.update({
                where: { id: existingView.id },
                data: {
                    timespent: existingView.timespent + (data.timespent || 0)
                }
            });
        }

        // Créer une nouvelle vue
        const view = await this.model.create({
            data: {
                userId: data.userId,
                videoId: data.videoId,
                timespent: data.timespent || 0
            }
        });

        // Incrémenter le compteur de vues pour la vidéo directement
        await this.prismaService.video.update({
            where: { id: data.videoId },
            data: {
                nbViews: {
                    increment: 1
                }
            }
        });

        // Incrémenter aussi le compteur de vues du projet associé
        const video = await this.prismaService.video.findUnique({
            where: { id: data.videoId },
            select: { projectId: true }
        });

        if (video?.projectId) {
            await this.counterService.updateViewCount('project', video.projectId, true);
        }

        return view;
    }

    /**
     * Finds all views with optional filters
     */
    async findAll(): Promise<View[]> {
        return this.model.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                video: {
                    select: {
                        id: true,
                        title: true,
                        videoUrl: true,
                        description: true,
                        nbViews: true
                    }
                }
            }
        });
    }

    /**
     * Finds views by user ID
     */
    async findByUser(userId: string): Promise<View[]> {
        return this.model.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        videoUrl: true,
                        description: true,
                        nbViews: true
                    }
                }
            }
        });
    }

    /**
     * Finds views by video ID
     */
    async findByVideo(videoId: string): Promise<View[]> {
        return this.model.findMany({
            where: { videoId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
    }

    /**
     * Gets the total view count for a specific video
     */
    async countVideoViews(videoId: string): Promise<{ count: number }> {
        const count = await this.model.count({
            where: { videoId }
        });
        return { count };
    }

    /**
     * Gets the total time spent viewing a specific video across all users
     */
    async getTotalTimeSpent(videoId: string): Promise<{ totalTime: number }> {
        const result = await this.model.aggregate({
            where: { videoId },
            _sum: {
                timespent: true
            }
        });
        return { totalTime: result._sum.timespent || 0 };
    }

    /**
     * Checks if a user has viewed a specific video
     */
    async hasUserViewed(userId: string, videoId: string): Promise<{ hasViewed: boolean }> {
        const view = await this.model.findFirst({
            where: {
                userId,
                videoId
            }
        });
        return { hasViewed: !!view };
    }

    /**
     * Updates an existing view (mainly for updating time spent)
     */
    async update(id: string, data: UpdateViewDto): Promise<View> {
        return this.model.update({
            where: { id },
            data: {
                timespent: data.timespent
            }
        });
    }

    /**
     * Removes a view and decrements the counter
     */
    async remove(id: string): Promise<View> {
        const view = await this.findOneOrFail(id);

        // Décrémenter le compteur de vues pour la vidéo
        await this.prismaService.video.update({
            where: { id: view.videoId },
            data: {
                nbViews: {
                    decrement: 1
                }
            }
        });

        // Décrémenter aussi le compteur de vues du projet associé
        const video = await this.prismaService.video.findUnique({
            where: { id: view.videoId },
            select: { projectId: true }
        });

        if (video?.projectId) {
            await this.counterService.updateViewCount('project', video.projectId, false);
        }

        return this.model.delete({
            where: { id }
        });
    }

    /**
     * Gets viewing statistics for a user
     */
    async getUserViewingStats(userId: string): Promise<{
        totalViews: number;
        totalTimeSpent: number;
        uniqueVideos: number;
    }> {
        const stats = await this.model.aggregate({
            where: { userId },
            _count: {
                id: true
            },
            _sum: {
                timespent: true
            }
        });

        const uniqueVideos = await this.model.groupBy({
            by: ['videoId'],
            where: { userId }
        });

        return {
            totalViews: stats._count.id || 0,
            totalTimeSpent: stats._sum.timespent || 0,
            uniqueVideos: uniqueVideos.length
        };
    }
}
