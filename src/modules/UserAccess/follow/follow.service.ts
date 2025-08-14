import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Follow, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateFollowDto, UpdateFollowDto, FollowResponseDto, FollowWithUserDetailsDto } from './dto';

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

    // Méthodes CRUD héritées du BaseService :
    // - findAll(): Promise<Follow[]>
    // - findByUser(userId: string): Promise<Follow[]>
    // - findOne(id: string): Promise<Follow>
    // - findOneOrFail(id: string): Promise<Follow>
    // - update(id: string, updateFollowDto: UpdateFollowDto): Promise<Follow>

    // Méthodes personnalisées pour le modèle Follow

    /**
     * Crée un suivi et retourne une FollowResponseDto
     */
    async createFollow(createFollowDto: CreateFollowDto): Promise<FollowResponseDto> {
        const follow = await this.create(createFollowDto);
        return new FollowResponseDto(follow);
    }

    /**
     * Trouve tous les suivis avec transformation en DTO
     */
    async findAllFollows(): Promise<FollowResponseDto[]> {
        const follows = await this.findAll();
        return follows.map(follow => new FollowResponseDto(follow));
    }

    /**
     * Trouve un suivi par ID avec transformation en DTO
     */
    async findFollowById(id: string): Promise<FollowResponseDto> {
        const follow = await this.findOne(id);
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
     * Trouve tous les utilisateurs suivis par un utilisateur donné
     */
    async getFollowing(userId: string): Promise<FollowWithUserDetailsDto[]> {
        const follows = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return follows.map(follow => ({
            ...new FollowResponseDto(follow),
            following: follow.following,
        }));
    }

    /**
     * Trouve tous les followers d'un utilisateur donné
     */
    async getFollowers(userId: string): Promise<FollowWithUserDetailsDto[]> {
        const follows = await this.prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return follows.map(follow => ({
            ...new FollowResponseDto(follow),
            follower: follow.follower,
        }));
    }

    /**
     * Vérifie si un utilisateur en suit un autre
     */
    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const follow = await this.prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });

        return !!follow;
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

    /**
     * Obtient les statistiques de suivi pour un utilisateur
     */
    async getFollowStats(userId: string): Promise<{
        followersCount: number;
        followingCount: number;
    }> {
        const [followersCount, followingCount] = await Promise.all([
            this.prisma.follow.count({
                where: { followingId: userId },
            }),
            this.prisma.follow.count({
                where: { followerId: userId },
            }),
        ]);

        return {
            followersCount,
            followingCount,
        };
    }

    /**
     * Trouve les suivis mutuels entre deux utilisateurs
     */
    async getMutualFollows(userId1: string, userId2: string): Promise<FollowWithUserDetailsDto[]> {
        // Utilisateurs que userId1 suit ET que userId2 suit aussi
        const mutualFollows = await this.prisma.follow.findMany({
            where: {
                followerId: userId1,
                followingId: {
                    in: await this.prisma.follow
                        .findMany({
                            where: { followerId: userId2 },
                            select: { followingId: true },
                        })
                        .then(follows => follows.map(f => f.followingId)),
                },
            },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return mutualFollows.map(follow => ({
            ...new FollowResponseDto(follow),
            following: follow.following,
        }));
    }
}
