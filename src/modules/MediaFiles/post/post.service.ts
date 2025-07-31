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

    // Méthodes CRUD héritées du BaseService :
    // - create(createPostDto: CreatePostDto): Promise<Post>
    // - findAll(): Promise<Post[]>
    // - findByUser(userId: string): Promise<Post[]>
    // - findOne(id: string): Promise<Post>
    // - findOneOrFail(id: string): Promise<Post>
    // - update(id: string, updatePostDto: UpdatePostDto): Promise<Post>
    // - remove(id: string): Promise<Post>

    // Méthodes personnalisées pour le modèle Post

    /**
     * Trouve tous les posts avec pagination
     */
    async findAllPaginated(paginationDto: PaginationDto): Promise<{
        data: Post[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }> {
        const { page = 1, limit = 20 } = paginationDto; // Default à 20 pour mobile
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                skip,
                take: limit,
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
     * Trouve tous les posts publics
     */
    async findPublicPosts(): Promise<Post[]> {
        return this.prisma.post.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve tous les posts publics avec pagination
     */
    async findPublicPostsPaginated(paginationDto: PaginationDto): Promise<{
        data: Post[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }> {
        const { page = 1, limit = 20 } = paginationDto; // Default à 20 pour mobile
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                where: { isPublic: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.post.count({
                where: { isPublic: true }
            })
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
     * Incrémente le nombre de likes d'un post
     */
    async incrementLikes(id: string): Promise<Post> {
        return await this.prisma.post.update({
            where: { id },
            data: {
                nbLikes: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Incrémente le nombre de vues d'un post
     */
    async incrementViews(id: string): Promise<Post> {
        return await this.prisma.post.update({
            where: { id },
            data: {
                nbViews: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Incrémente le nombre de commentaires d'un post
     */
    async incrementComments(id: string): Promise<Post> {
        return await this.prisma.post.update({
            where: { id },
            data: {
                nbComments: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Incrémente le nombre de partages d'un post
     */
    async incrementShares(id: string): Promise<Post> {
        return await this.prisma.post.update({
            where: { id },
            data: {
                nbShares: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Trouve les posts avec leurs relations (media, likes, comments, etc.)
     */
    async findAllWithRelations(): Promise<any[]> {
        return this.prisma.post.findMany({
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
            },
            orderBy: { createdAt: 'desc' }
        });
    }

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
}
