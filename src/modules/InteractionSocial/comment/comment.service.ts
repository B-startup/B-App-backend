import { Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CounterService } from '../../../core/common/services/counter.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService extends BaseCrudServiceImpl<
    Comment,
    CreateCommentDto,
    UpdateCommentDto
> {
    protected model = this.prisma.comment;

    constructor(
        prisma: PrismaService,
        private readonly counterService: CounterService
    ) {
        super(prisma);
    }

    /**
     * Create a comment and update parent entity counters
     */
    async create(data: CreateCommentDto): Promise<Comment> {
        const comment = await super.create(data);

        // Incrémenter le compteur de commentaires dans l'entité parente
        if (data.projectId) {
            await this.counterService.updateCommentCount(
                'project',
                data.projectId,
                true
            );
        } else if (data.postId) {
            await this.counterService.updateCommentCount(
                'post',
                data.postId,
                true
            );
        }

        return comment;
    }

    /**
     * Remove a comment and update parent entity counters
     */
    async remove(id: string): Promise<Comment> {
        // Récupérer le commentaire avant suppression pour connaître l'entité parente
        const commentToDelete = await this.findOne(id);

        const deletedComment = await super.remove(id);

        // Décrémenter le compteur de commentaires dans l'entité parente
        if (commentToDelete.projectId) {
            await this.counterService.updateCommentCount(
                'project',
                commentToDelete.projectId,
                false
            );
        } else if (commentToDelete.postId) {
            await this.counterService.updateCommentCount(
                'post',
                commentToDelete.postId,
                false
            );
        }

        return deletedComment;
    }

    /**
     * Find all comments for a specific project
     */
    async findByProject(projectId: string): Promise<Comment[]> {
        return this.model.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Find all comments for a specific post
     */
    async findByPost(postId: string): Promise<Comment[]> {
        return this.model.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                replies: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Find all comments for a specific user
     */
    async findByUser(userId: string): Promise<Comment[]> {
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
     * Find replies for a specific comment
     */
    async findReplies(parentId: string): Promise<Comment[]> {
        return this.model.findMany({
            where: { parentId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    /**
     * Increment the like count for a comment
     * Note: Cette méthode est maintenant obsolète car les likes sont gérés par LikeService
     * @deprecated Utilisez LikeService.toggleLike() à la place
     */
    async incrementLikes(commentId: string): Promise<Comment> {
        return this.model.update({
            where: { id: commentId },
            data: {
                nbLikes: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Decrement the like count for a comment
     * Note: Cette méthode est maintenant obsolète car les likes sont gérés par LikeService
     * @deprecated Utilisez LikeService.toggleLike() à la place
     */
    async decrementLikes(commentId: string): Promise<Comment> {
        return this.model.update({
            where: { id: commentId },
            data: {
                nbLikes: {
                    decrement: 1
                }
            }
        });
    }

    /**
     * Get comment statistics for a project
     */
    async getProjectCommentStats(projectId: string) {
        const totalComments = await this.model.count({
            where: { projectId }
        });

        const topLevelComments = await this.model.count({
            where: {
                projectId,
                parentId: null
            }
        });

        const replies = totalComments - topLevelComments;

        return {
            totalComments,
            topLevelComments,
            replies
        };
    }

    /**
     * Get comment statistics for a post
     */
    async getPostCommentStats(postId: string) {
        const totalComments = await this.model.count({
            where: { postId }
        });

        const topLevelComments = await this.model.count({
            where: {
                postId,
                parentId: null
            }
        });

        const replies = totalComments - topLevelComments;

        return {
            totalComments,
            topLevelComments,
            replies
        };
    }
}
