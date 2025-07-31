import { Injectable, ConflictException } from '@nestjs/common';
import { Like } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CounterService } from '../../../core/common/services/counter.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Injectable()
export class LikeService extends BaseCrudServiceImpl<
    Like,
    CreateLikeDto,
    UpdateLikeDto
> {
    protected model = this.prisma.like;

    constructor(
        prisma: PrismaService,
        private readonly counterService: CounterService
    ) {
        super(prisma);
    }

    /**
     * Create a like with duplicate check and update counters
     */
    async create(data: CreateLikeDto): Promise<Like> {
        // Check if user already liked this item
        const existingLike = await this.findExistingLike(data);
        if (existingLike) {
            throw new ConflictException('User has already liked this item');
        }

        const like = await super.create(data);
        
        // Incrémenter le compteur de likes dans l'entité cible
        await this.updateTargetLikeCounter(data, true);
        
        return like;
    }

    /**
     * Remove a like and update counters
     */
    async remove(id: string): Promise<Like> {
        // Récupérer le like avant suppression pour connaître l'entité cible
        const likeToDelete = await this.findOne(id);
        
        const deletedLike = await super.remove(id);
        
        // Décrémenter le compteur de likes dans l'entité cible
        const likeData: CreateLikeDto = {
            userId: likeToDelete.userId,
            projectId: likeToDelete.projectId || undefined,
            postId: likeToDelete.postId || undefined,
            commentId: likeToDelete.commentId || undefined
        };
        await this.updateTargetLikeCounter(likeData, false);
        
        return deletedLike;
    }

    /**
     * Toggle like (like/unlike) with counter updates
     */
    async toggleLike(data: CreateLikeDto): Promise<{ liked: boolean; like?: Like }> {
        const existingLike = await this.findExistingLike(data);
        
        if (existingLike) {
            // Unlike: remove the like
            await this.remove(existingLike.id);
            return { liked: false };
        } else {
            // Like: create new like
            const newLike = await this.create(data);
            return { liked: true, like: newLike };
        }
    }

    /**
     * Met à jour le compteur de likes de l'entité cible
     */
    private async updateTargetLikeCounter(data: CreateLikeDto, increment: boolean): Promise<void> {
        if (data.projectId) {
            await this.counterService.updateLikeCount('project', data.projectId, increment);
        } else if (data.postId) {
            await this.counterService.updateLikeCount('post', data.postId, increment);
        } else if (data.commentId) {
            await this.counterService.updateLikeCount('comment', data.commentId, increment);
        }
    }

    /**
     * Find existing like by user and target
     */
    private async findExistingLike(data: CreateLikeDto): Promise<Like | null> {
        const whereClause: any = {
            userId: data.userId
        };

        if (data.projectId) {
            whereClause.projectId = data.projectId;
        } else if (data.postId) {
            whereClause.postId = data.postId;
        } else if (data.commentId) {
            whereClause.commentId = data.commentId;
        }

        return this.model.findFirst({
            where: whereClause
        });
    }

    /**
     * Find all likes for a specific project
     */
    async findByProject(projectId: string): Promise<Like[]> {
        return this.model.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Find all likes for a specific post
     */
    async findByPost(postId: string): Promise<Like[]> {
        return this.model.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Find all likes for a specific comment
     */
    async findByComment(commentId: string): Promise<Like[]> {
        return this.model.findMany({
            where: { commentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Find all likes for a specific user
     */
    async findByUser(userId: string): Promise<Like[]> {
        return this.model.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Count likes for a project
     */
    async countProjectLikes(projectId: string): Promise<number> {
        return this.model.count({
            where: { projectId }
        });
    }

    /**
     * Count likes for a post
     */
    async countPostLikes(postId: string): Promise<number> {
        return this.model.count({
            where: { postId }
        });
    }

    /**
     * Count likes for a comment
     */
    async countCommentLikes(commentId: string): Promise<number> {
        return this.model.count({
            where: { commentId }
        });
    }

    /**
     * Check if a user has liked a specific item
     */
    async hasUserLiked(userId: string, targetId: string, targetType: 'project' | 'post' | 'comment'): Promise<boolean> {
        const whereClause: any = { userId };
        
        switch (targetType) {
            case 'project':
                whereClause.projectId = targetId;
                break;
            case 'post':
                whereClause.postId = targetId;
                break;
            case 'comment':
                whereClause.commentId = targetId;
                break;
        }

        const like = await this.model.findFirst({
            where: whereClause
        });

        return !!like;
    }

    /**
     * Get user's like activity
     */
    async getUserLikeActivity(userId: string) {
        const [projectLikes, postLikes, commentLikes] = await Promise.all([
            this.model.count({ where: { userId, projectId: { not: null } } }),
            this.model.count({ where: { userId, postId: { not: null } } }),
            this.model.count({ where: { userId, commentId: { not: null } } })
        ]);

        return {
            totalLikes: projectLikes + postLikes + commentLikes,
            projectLikes,
            postLikes,
            commentLikes
        };
    }
}
