import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PostShared } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseService } from '../../../core/services/base.service';
import { CreatePostSharedDto } from './dto/create-post-shared.dto';
import { UpdatePostSharedDto } from './dto/update-post-shared.dto';

@Injectable()
export class PostSharedService extends BaseService<
    PostShared,
    CreatePostSharedDto,
    UpdatePostSharedDto,
    'PostShared'
> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.postShared, 'PostShared');
    }

    // Méthodes CRUD héritées du BaseService :
    // - create(createPostSharedDto: CreatePostSharedDto): Promise<PostShared>
    // - findAll(): Promise<PostShared[]>
    // - findByUser(userId: string): Promise<PostShared[]>
    // - findOne(id: string): Promise<PostShared>
    // - findOneOrFail(id: string): Promise<PostShared>
    // - update(id: string, updatePostSharedDto: UpdatePostSharedDto): Promise<PostShared>
    // - remove(id: string): Promise<PostShared>

    // Méthodes personnalisées pour le modèle PostShared

    /**
     * Vérifie si un utilisateur a déjà partagé un post spécifique
     */
    async hasUserSharedPost(userId: string, postId: string): Promise<boolean> {
        const existingShare = await this.prisma.postShared.findFirst({
            where: {
                userId,
                postId
            }
        });
        return !!existingShare;
    }

    /**
     * Partage un post (avec vérification d'unicité)
     */
    async sharePost(createPostSharedDto: CreatePostSharedDto): Promise<PostShared> {
        const { userId, postId } = createPostSharedDto;

        // Vérifier si l'utilisateur a déjà partagé ce post
        const alreadyShared = await this.hasUserSharedPost(userId, postId);
        if (alreadyShared) {
            throw new ConflictException('User has already shared this post');
        }

        // Vérifier que le post existe
        const post = await this.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Vérifier que l'utilisateur existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Créer le partage
        const postShared = await this.create(createPostSharedDto);

        // Incrémenter le compteur de partages du post
        await this.prisma.post.update({
            where: { id: postId },
            data: {
                nbShares: {
                    increment: 1
                }
            }
        });

        return postShared;
    }

    /**
     * Annule le partage d'un post
     */
    async unsharePost(userId: string, postId: string): Promise<PostShared> {
        const existingShare = await this.prisma.postShared.findFirst({
            where: {
                userId,
                postId
            }
        });

        if (!existingShare) {
            throw new NotFoundException('Post share not found');
        }

        // Supprimer le partage
        const deletedShare = await this.remove(existingShare.id);

        // Décrémenter le compteur de partages du post
        await this.prisma.post.update({
            where: { id: postId },
            data: {
                nbShares: {
                    decrement: 1
                }
            }
        });

        return deletedShare;
    }

    /**
     * Trouve tous les partages d'un post spécifique
     */
    async findByPost(postId: string): Promise<PostShared[]> {
        return this.prisma.postShared.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve tous les partages d'un post avec les informations utilisateur
     */
    async findByPostWithUsers(postId: string): Promise<any[]> {
        return this.prisma.postShared.findMany({
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
     * Trouve tous les posts partagés par un utilisateur avec les détails du post
     */
    async findUserSharesWithPosts(userId: string): Promise<any[]> {
        return this.prisma.postShared.findMany({
            where: { userId },
            include: {
                post: {
                    select: {
                        id: true,
                        title: true,
                        content: true,
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
     * Compte le nombre de partages d'un post
     */
    async countSharesByPost(postId: string): Promise<number> {
        return this.prisma.postShared.count({
            where: { postId }
        });
    }

    /**
     * Compte le nombre de posts partagés par un utilisateur
     */
    async countSharesByUser(userId: string): Promise<number> {
        return this.prisma.postShared.count({
            where: { userId }
        });
    }
}
