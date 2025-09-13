import { Injectable } from '@nestjs/common';
import { Post, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PostService extends BaseCrudServiceImpl<
    Post,
    CreatePostDto,
    UpdatePostDto
> {
    protected model = this.prisma.post;

    constructor(protected readonly prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Override de la méthode create pour incrémenter nbPosts de l'utilisateur
     */
    async create(createPostDto: CreatePostDto): Promise<Post> {
        // Utiliser une transaction pour créer le post et incrémenter nbPosts
        return await this.prisma.$transaction(async (prisma) => {
            // Créer le post
            const newPost = await prisma.post.create({
                data: createPostDto
            });

            // Incrémenter nbPosts de l'utilisateur
            await prisma.user.update({
                where: { id: createPostDto.userId },
                data: {
                    nbPosts: {
                        increment: 1
                    }
                }
            });

            return newPost;
        });
    }

    /**
     * Override de la méthode remove pour décrémenter nbPosts de l'utilisateur
     */
    async remove(id: string): Promise<Post> {
        // Utiliser une transaction pour supprimer le post et décrémenter nbPosts
        return await this.prisma.$transaction(async (prisma) => {
            // Récupérer le post pour obtenir l'userId avant suppression
            const postToDelete = await prisma.post.findUniqueOrThrow({
                where: { id },
                select: { userId: true }
            });

            // Supprimer le post
            const deletedPost = await prisma.post.delete({
                where: { id }
            });

            // Décrémenter nbPosts de l'utilisateur (minimum 0)
            await prisma.user.update({
                where: { id: postToDelete.userId },
                data: {
                    nbPosts: {
                        decrement: 1
                    }
                }
            });

            return deletedPost;
        });
    }

    // Méthodes CRUD héritées du BaseService :
    // - findAll(): Promise<Post[]>
    // - findByUser(userId: string): Promise<Post[]>
    // - findOne(id: string): Promise<Post>
    // - findOneOrFail(id: string): Promise<Post>
    // - update(id: string, updatePostDto: UpdatePostDto): Promise<Post>


    // Méthodes personnalisées pour le modèle Post

    



    /**
     * Trouve un post avec toutes ses relations
     */
    async findOneWithRelations(id: string): Promise<any> {
        return this.prisma.post.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                media: true,
                Like: true,
                Comment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                PostSector: {
                    include: {
                        sector: true
                    }
                },
                PostTag: {
                    include: {
                        tag: true
                    }
                }
            }
        });
    }

    // ==================== HYBRID APPROACH METHODS ====================

    /**
     * Get all posts with optimized selection (for feeds/lists)
     */
    async findAllOptimized() {
        return this.prisma.post.findMany({
            select: {
                id: true,
                content: true,
                isPublic: true,
                createdAt: true,
                updatedAt: true,
                nbLikes: true,
                nbViews: true,
                nbComments: true,
                nbShares: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                media: {
                    select: {
                        id: true,
                        mediaUrl: true,
                        mediaType: true
                    },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get posts by user (optimized selection)
     */
    async findByUserOptimized(userId: string) {
        return this.prisma.post.findMany({
            where: { userId },
            select: {
                id: true,
                content: true,
                isPublic: true,
                createdAt: true,
                updatedAt: true,
                nbLikes: true,
                nbViews: true,
                nbComments: true,
                nbShares: true,
                media: {
                    select: {
                        id: true,
                        mediaUrl: true,
                        mediaType: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get public posts (optimized selection for public feed)
     */
    async findPublicPostsOptimized() {
        return this.prisma.post.findMany({
            where: { isPublic: true },
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                nbLikes: true,
                nbViews: true,
                nbComments: true,
                nbShares: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                media: {
                    select: {
                        id: true,
                        mediaUrl: true,
                        mediaType: true
                    },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get paginated posts (optimized selection)
     */
    async findAllPaginatedOptimized(paginationDto: PaginationDto) {
        const { page = 1, limit = 20 } = paginationDto;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    content: true,
                    isPublic: true,
                    createdAt: true,
                    nbLikes: true,
                    nbViews: true,
                    nbComments: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    },
                    media: {
                        select: {
                            id: true,
                            mediaUrl: true,
                            mediaType: true
                        },
                        take: 1
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.post.count()
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    }

    /**
     * Search posts by content (optimized selection)
     */
    async searchPostsOptimized(searchTerm: string) {
        return this.prisma.post.findMany({
            where: {
                AND: [
                    { isPublic: true },
                    {
                        content: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            select: {
                id: true,
                content: true,
                createdAt: true,
                nbLikes: true,
                nbViews: true,
                nbComments: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                media: {
                    select: {
                        id: true,
                        mediaUrl: true,
                        mediaType: true
                    },
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
}
