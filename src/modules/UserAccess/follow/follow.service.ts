import { Injectable, ConflictException } from '@nestjs/common';
import { Follow, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateFollowDto, UpdateFollowDto, FollowResponseDto } from './dto';

@Injectable()
export class FollowService extends BaseCrudServiceImpl<
    Follow,
    CreateFollowDto,
    UpdateFollowDto
> {
    protected model = this.prisma.follow;

    constructor(protected readonly prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Override de la méthode create pour gérer les suivis avec incrémentation des compteurs
     */
    async create(createFollowDto: CreateFollowDto): Promise<Follow> {
        // Vérifier que l'utilisateur ne se suit pas lui-même
        if (createFollowDto.followerId === createFollowDto.followingId) {
            throw new ConflictException('Un utilisateur ne peut pas se suivre lui-même');
        }

        // Vérifier si la relation existe déjà
        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: createFollowDto.followerId,
                    followingId: createFollowDto.followingId,
                },
            },
        });

        if (existingFollow) {
            throw new ConflictException('Cette relation de suivi existe déjà');
        }

        // Utiliser une transaction pour créer le suivi et incrémenter les compteurs
        return await this.prisma.$transaction(async (prisma) => {
            // Créer la relation de suivi
            const newFollow = await prisma.follow.create({
                data: createFollowDto,
            });

            // Incrémenter nbFollowing pour le follower
            await prisma.user.update({
                where: { id: createFollowDto.followerId },
                data: {
                    nbFollowing: {
                        increment: 1,
                    },
                },
            });

            // Incrémenter nbFollowers pour l'utilisateur suivi
            await prisma.user.update({
                where: { id: createFollowDto.followingId },
                data: {
                    nbFollowers: {
                        increment: 1,
                    },
                },
            });

            return newFollow;
        });
    }

    /**
     * Override de la méthode remove pour gérer la suppression avec décrémentation des compteurs
     */
    async remove(id: string): Promise<Follow> {
        // Récupérer la relation pour obtenir les IDs avant suppression
        const followToDelete = await this.prisma.follow.findUniqueOrThrow({
            where: { id },
            select: { followerId: true, followingId: true },
        });

        // Utiliser une transaction pour supprimer le suivi et décrémenter les compteurs
        return await this.prisma.$transaction(async (prisma) => {
            // Supprimer la relation de suivi
            const deletedFollow = await prisma.follow.delete({
                where: { id },
            });

            // Décrémenter nbFollowing pour le follower (minimum 0)
            await prisma.user.update({
                where: { id: followToDelete.followerId },
                data: {
                    nbFollowing: {
                        decrement: 1,
                    },
                },
            });

            // Décrémenter nbFollowers pour l'utilisateur suivi (minimum 0)
            await prisma.user.update({
                where: { id: followToDelete.followingId },
                data: {
                    nbFollowers: {
                        decrement: 1,
                    },
                },
            });

            return deletedFollow;
        });
    }

    /**
     * Crée un suivi et retourne une FollowResponseDto
     */
    async createFollow(createFollowDto: CreateFollowDto): Promise<FollowResponseDto> {
        const follow = await this.create(createFollowDto);
        return new FollowResponseDto(follow);
    }

    /**
     * Supprime un suivi par ID
     */
    async removeFollow(id: string): Promise<FollowResponseDto> {
        const follow = await this.remove(id);
        return new FollowResponseDto(follow);
    }

    /**
     * Trouve tous les utilisateurs suivis par un utilisateur donné (optimisé)
     */
    async getFollowing(userId: string): Promise<any[]> {
        return this.prisma.follow.findMany({
            where: { followerId: userId },
            select: {
                id: true,
                followingId: true,
                createdAt: true,
                following: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        nbFollowers: true,
                        nbFollowing: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve tous les followers d'un utilisateur donné (optimisé)
     */
    async getFollowers(userId: string): Promise<any[]> {
        return this.prisma.follow.findMany({
            where: { followingId: userId },
            select: {
                id: true,
                followerId: true,
                createdAt: true,
                follower: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        nbFollowers: true,
                        nbFollowing: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Toggle le suivi entre deux utilisateurs
     */
    async toggleFollow(followerId: string, followingId: string): Promise<{
        isFollowing: boolean;
        follow?: FollowResponseDto;
    }> {
        // Validation des paramètres
        if (!followerId || !followingId) {
            throw new ConflictException('followerId et followingId sont requis');
        }

        // Vérifier que l'utilisateur ne se suit pas lui-même
        if (followerId === followingId) {
            throw new ConflictException('Un utilisateur ne peut pas se suivre lui-même');
        }

        const existingFollow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        if (existingFollow) {
            // Unfollow
            await this.remove(existingFollow.id);
            return { isFollowing: false };
        } else {
            // Follow
            const newFollow = await this.create({ followerId, followingId });
            return {
                isFollowing: true,
                follow: new FollowResponseDto(newFollow),
            };
        }
    }
}
