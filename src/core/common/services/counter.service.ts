import { PrismaClient } from '@prisma/client';

/**
 * Service utilitaire pour gérer les compteurs automatiques
 * Synchronise les compteurs (likes, comments, views, etc.) entre les entités
 */
export class CounterService {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Met à jour le compteur de likes pour une entité
     */
    async updateLikeCount(
        entityType: 'project' | 'post' | 'comment',
        entityId: string,
        increment: boolean = true
    ): Promise<void> {
        const operation = increment ? 'increment' : 'decrement';
        
        switch (entityType) {
            case 'project':
                await this.prisma.project.update({
                    where: { id: entityId },
                    data: {
                        nbLikes: {
                            [operation]: 1
                        }
                    }
                });
                break;
                
            case 'post':
                await this.prisma.post.update({
                    where: { id: entityId },
                    data: {
                        nbLikes: {
                            [operation]: 1
                        }
                    }
                });
                break;
                
            case 'comment':
                await this.prisma.comment.update({
                    where: { id: entityId },
                    data: {
                        nbLikes: {
                            [operation]: 1
                        }
                    }
                });
                break;
        }
    }

    /**
     * Met à jour le compteur de commentaires pour une entité
     */
    async updateCommentCount(
        entityType: 'project' | 'post',
        entityId: string,
        increment: boolean = true
    ): Promise<void> {
        const operation = increment ? 'increment' : 'decrement';
        
        switch (entityType) {
            case 'project':
                await this.prisma.project.update({
                    where: { id: entityId },
                    data: {
                        nbComments: {
                            [operation]: 1
                        }
                    }
                });
                break;
                
            case 'post':
                await this.prisma.post.update({
                    where: { id: entityId },
                    data: {
                        nbComments: {
                            [operation]: 1
                        }
                    }
                });
                break;
        }
    }

    /**
     * Met à jour le compteur de vues pour une entité
     */
    async updateViewCount(
        entityType: 'project' | 'post',
        entityId: string,
        increment: boolean = true
    ): Promise<void> {
        const operation = increment ? 'increment' : 'decrement';
        
        switch (entityType) {
            case 'project':
                await this.prisma.project.update({
                    where: { id: entityId },
                    data: {
                        nbViews: {
                            [operation]: 1
                        }
                    }
                });
                break;
                
            case 'post':
                await this.prisma.post.update({
                    where: { id: entityId },
                    data: {
                        nbViews: {
                            [operation]: 1
                        }
                    }
                });
                break;
        }
    }

    /**
     * Met à jour le compteur de partages pour les posts
     */
    async updateShareCount(
        postId: string,
        increment: boolean = true
    ): Promise<void> {
        const operation = increment ? 'increment' : 'decrement';
        
        await this.prisma.post.update({
            where: { id: postId },
            data: {
                nbShares: {
                    [operation]: 1
                }
            }
        });
    }

    /**
     * Met à jour le compteur de connexions pour les projets
     */
    async updateConnectCount(
        projectId: string,
        increment: boolean = true
    ): Promise<void> {
        const operation = increment ? 'increment' : 'decrement';
        
        await this.prisma.project.update({
            where: { id: projectId },
            data: {
                nbConnects: {
                    [operation]: 1
                }
            }
        });
    }

    /**
     * Recalcule et met à jour tous les compteurs pour une entité
     * Utile pour la maintenance et la synchronisation
     */
    async recalculateCounters(
        entityType: 'project' | 'post' | 'comment',
        entityId: string
    ): Promise<void> {
        switch (entityType) {
            case 'project': {
                const [projectLikes, projectComments, projectConnects] = await Promise.all([
                    this.prisma.like.count({ where: { projectId: entityId } }),
                    this.prisma.comment.count({ where: { projectId: entityId } }),
                    this.prisma.connect.count({ where: { projectId: entityId } })
                ]);
                
                await this.prisma.project.update({
                    where: { id: entityId },
                    data: {
                        nbLikes: projectLikes,
                        nbComments: projectComments,
                        nbConnects: projectConnects
                        // nbViews doit être géré manuellement via updateViewCount
                    }
                });
                break;
            }
                
            case 'post': {
                const [postLikes, postComments, postShares] = await Promise.all([
                    this.prisma.like.count({ where: { postId: entityId } }),
                    this.prisma.comment.count({ where: { postId: entityId } }),
                    this.prisma.postShared.count({ where: { postId: entityId } })
                ]);
                
                await this.prisma.post.update({
                    where: { id: entityId },
                    data: {
                        nbLikes: postLikes,
                        nbComments: postComments,
                        nbShares: postShares
                        // nbViews doit être géré manuellement via updateViewCount
                    }
                });
                break;
            }
                
            case 'comment': {
                const commentLikes = await this.prisma.like.count({ 
                    where: { commentId: entityId } 
                });
                
                await this.prisma.comment.update({
                    where: { id: entityId },
                    data: {
                        nbLikes: commentLikes
                    }
                });
                break;
            }
        }
    }

    /**
     * Méthode utilitaire pour détecter automatiquement le type d'entité
     */
    private async detectEntityType(entityId: string): Promise<'project' | 'post' | 'comment' | null> {
        // Chercher dans les projets
        const project = await this.prisma.project.findUnique({ where: { id: entityId } });
        if (project) return 'project';
        
        // Chercher dans les posts
        const post = await this.prisma.post.findUnique({ where: { id: entityId } });
        if (post) return 'post';
        
        // Chercher dans les commentaires
        const comment = await this.prisma.comment.findUnique({ where: { id: entityId } });
        if (comment) return 'comment';
        
        return null;
    }
}
