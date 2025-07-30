import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PostSector } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseService } from '../../../core/services/base.service';
import { CreatePostSectorDto } from './dto/create-post-sector.dto';
import { UpdatePostSectorDto } from './dto/update-post-sector.dto';

@Injectable()
export class PostSectorService extends BaseService<
    PostSector,
    CreatePostSectorDto,
    UpdatePostSectorDto,
    'PostSector'
> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.postSector, 'PostSector');
    }

    // Méthodes CRUD héritées du BaseService :
    // - create(createPostSectorDto: CreatePostSectorDto): Promise<PostSector>
    // - findAll(): Promise<PostSector[]>
    // - findByUser(userId: string): Promise<PostSector[]>
    // - findOne(id: string): Promise<PostSector>
    // - findOneOrFail(id: string): Promise<PostSector>
    // - update(id: string, updatePostSectorDto: UpdatePostSectorDto): Promise<PostSector>
    // - remove(id: string): Promise<PostSector>

    // Méthodes personnalisées pour le modèle PostSector

    /**
     * Vérifie si une association post-secteur existe déjà
     */
    async hasPostSectorAssociation(postId: string, sectorId: string): Promise<boolean> {
        const existingAssociation = await this.prisma.postSector.findFirst({
            where: {
                postId,
                sectorId
            }
        });
        return !!existingAssociation;
    }

    /**
     * Crée une association post-secteur avec vérification d'unicité
     */
    async createAssociation(createPostSectorDto: CreatePostSectorDto): Promise<PostSector> {
        const { postId, sectorId } = createPostSectorDto;

        // Vérifier si l'association existe déjà
        const alreadyExists = await this.hasPostSectorAssociation(postId, sectorId);
        if (alreadyExists) {
            throw new ConflictException('This post is already associated with this sector');
        }

        // Vérifier que le post existe
        const post = await this.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        // Vérifier que le secteur existe
        const sector = await this.prisma.sector.findUnique({
            where: { id: sectorId }
        });
        if (!sector) {
            throw new NotFoundException('Sector not found');
        }

        return this.create(createPostSectorDto);
    }

    /**
     * Trouve toutes les associations d'un post spécifique
     */
    async findByPost(postId: string): Promise<PostSector[]> {
        return this.prisma.postSector.findMany({
            where: { postId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un secteur spécifique
     */
    async findBySector(sectorId: string): Promise<PostSector[]> {
        return this.prisma.postSector.findMany({
            where: { sectorId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un post avec les détails du secteur
     */
    async findByPostWithSectors(postId: string): Promise<any[]> {
        return this.prisma.postSector.findMany({
            where: { postId },
            include: {
                sector: {
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
     * Trouve toutes les associations d'un secteur avec les détails du post
     */
    async findBySectorWithPosts(sectorId: string): Promise<any[]> {
        return this.prisma.postSector.findMany({
            where: { sectorId },
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
     * Supprime une association post-secteur spécifique
     */
    async removeAssociation(postId: string, sectorId: string): Promise<PostSector> {
        const existingAssociation = await this.prisma.postSector.findFirst({
            where: {
                postId,
                sectorId
            }
        });

        if (!existingAssociation) {
            throw new NotFoundException('Post-sector association not found');
        }

        return this.remove(existingAssociation.id);
    }

    /**
     * Compte le nombre d'associations pour un post
     */
    async countByPost(postId: string): Promise<number> {
        return this.prisma.postSector.count({
            where: { postId }
        });
    }

    /**
     * Compte le nombre d'associations pour un secteur
     */
    async countBySector(sectorId: string): Promise<number> {
        return this.prisma.postSector.count({
            where: { sectorId }
        });
    }

    /**
     * Trouve tous les secteurs populaires (avec le plus de posts)
     */
    async findPopularSectors(limit: number = 10): Promise<any[]> {
        const sectorCounts = await this.prisma.postSector.groupBy({
            by: ['sectorId'],
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

        // Récupérer les détails des secteurs
        const sectorIds = sectorCounts.map(item => item.sectorId);
        const sectors = await this.prisma.sector.findMany({
            where: {
                id: {
                    in: sectorIds
                }
            }
        });

        // Combiner les données
        return sectorCounts.map(count => {
            const sector = sectors.find(s => s.id === count.sectorId);
            return {
                ...sector,
                postCount: count._count.postId
            };
        });
    }
}
