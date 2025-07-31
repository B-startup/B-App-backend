import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PostTag } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseService } from '../../../core/services/base.service';
import { CreatePostTagDto } from './dto/create-post-tag.dto';
import { UpdatePostTagDto } from './dto/update-post-tag.dto';

@Injectable()
export class PostTagService extends BaseService<
    PostTag,
    CreatePostTagDto,
    UpdatePostTagDto,
    'PostTag'
> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.postTag, 'PostTag');
    }

    // Méthodes CRUD héritées du BaseService :
    // - create(createPostTagDto: CreatePostTagDto): Promise<PostTag>
    // - findAll(): Promise<PostTag[]>
    // - findByUser(userId: string): Promise<PostTag[]>
    // - findOne(id: string): Promise<PostTag>
    // - findOneOrFail(id: string): Promise<PostTag>
    // - update(id: string, updatePostTagDto: UpdatePostTagDto): Promise<PostTag>
    // - remove(id: string): Promise<PostTag>

    // Méthodes personnalisées pour le modèle PostTag

    /**
     * Vérifie si une association post-tag existe déjà
     */
    async hasPostTagAssociation(postId: string, tagId: string): Promise<boolean> {
        const existingAssociation = await this.prisma.postTag.findFirst({
            where: {
                postId,
                tagId
            }
        });
        return !!existingAssociation;
    }

    /**
     * Crée une association post-tag avec vérification d'unicité
     */
    async createAssociation(createPostTagDto: CreatePostTagDto): Promise<PostTag> {
        const { postId, tagId } = createPostTagDto;

        // Vérifier si l'association existe déjà
        const alreadyExists = await this.hasPostTagAssociation(postId, tagId);
        if (alreadyExists) {
            throw new ConflictException('This post is already associated with this tag');
        }

        // Vérifier que le post existe
        const post = await this.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Vérifier que le tag existe
        const tag = await this.prisma.tag.findUnique({
            where: { id: tagId }
        });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return this.create(createPostTagDto);
    }

    /**
     * Trouve toutes les associations d'un post spécifique
     */
    async findByPost(postId: string): Promise<PostTag[]> {
        return this.prisma.postTag.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un tag spécifique
     */
    async findByTag(tagId: string): Promise<PostTag[]> {
        return this.prisma.postTag.findMany({
            where: { tagId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un post avec les détails du tag
     */
    async findByPostWithTags(postId: string): Promise<any[]> {
        return this.prisma.postTag.findMany({
            where: { postId },
            include: {
                tag: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un tag avec les détails du post
     */
    async findByTagWithPosts(tagId: string): Promise<any[]> {
        return this.prisma.postTag.findMany({
            where: { tagId },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        isPublic: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Supprime une association post-tag spécifique
     */
    async removeAssociation(postId: string, tagId: string): Promise<PostTag> {
        const existingAssociation = await this.prisma.postTag.findFirst({
            where: {
                postId,
                tagId
            }
        });

        if (!existingAssociation) {
            throw new NotFoundException('Post-tag association not found');
        }

        return this.remove(existingAssociation.id);
    }

    /**
     * Ajoute plusieurs tags à un post
     */
    async addMultipleTagsToPost(postId: string, tagIds: string[]): Promise<PostTag[]> {
        // Vérifier que le post existe
        const post = await this.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Vérifier que tous les tags existent
        const tags = await this.prisma.tag.findMany({
            where: {
                id: {
                    in: tagIds
                }
            }
        });
        if (tags.length !== tagIds.length) {
            throw new NotFoundException('One or more tags not found');
        }

        // Créer les associations qui n'existent pas encore
        const results: PostTag[] = [];
        for (const tagId of tagIds) {
            const exists = await this.hasPostTagAssociation(postId, tagId);
            if (!exists) {
                const association = await this.create({ postId, tagId });
                results.push(association);
            }
        }

        return results;
    }

    /**
     * Compte le nombre d'associations pour un post
     */
    async countByPost(postId: string): Promise<number> {
        return this.prisma.postTag.count({
            where: { postId }
        });
    }

    /**
     * Compte le nombre d'associations pour un tag
     */
    async countByTag(tagId: string): Promise<number> {
        return this.prisma.postTag.count({
            where: { tagId }
        });
    }

    /**
     * Trouve tous les tags populaires (avec le plus de posts)
     */
    async findPopularTags(limit: number = 10): Promise<any[]> {
        const tagCounts = await this.prisma.postTag.groupBy({
            by: ['tagId'],
            _count: {
                postId: true
            },
            orderBy: {
                _count: {
                    postId: 'desc'
                }
            },
            take: limit
        });

        // Récupérer les détails des tags
        const tagIds = tagCounts.map(item => item.tagId);
        const tags = await this.prisma.tag.findMany({
            where: {
                id: {
                    in: tagIds
                }
            }
        });

        // Combiner les données
        return tagCounts.map(count => {
            const tag = tags.find(t => t.id === count.tagId);
            return {
                ...tag,
                postCount: count._count.postId
            };
        });
    }

    /**
     * Trouve les posts similaires basés sur les tags partagés
     */
    async findSimilarPosts(postId: string, limit: number = 5): Promise<any[]> {
        // Récupérer les tags du post
        const postTags = await this.findByPost(postId);
        const tagIds = postTags.map(pt => pt.tagId);

        if (tagIds.length === 0) {
            return [];
        }

        // Trouver les posts qui partagent au moins un tag
        const similarPosts = await this.prisma.postTag.findMany({
            where: {
                tagId: {
                    in: tagIds
                },
                postId: {
                    not: postId // Exclure le post original
                }
            },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        isPublic: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true
                            }
                        }
                    }
                }
            },
            take: limit * 2 // Prendre plus pour filtrer les doublons
        });

        // Éliminer les doublons et limiter les résultats
        const uniquePosts = Array.from(
            new Map(similarPosts.map(item => [item.postId, item.post])).values()
        ).slice(0, limit);

        return uniquePosts;
    }
}
