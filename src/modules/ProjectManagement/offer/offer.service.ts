import { Injectable } from '@nestjs/common';
import { Offer, PrismaClient, StatusOffer } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OfferService extends BaseCrudServiceImpl<
    Offer,
    CreateOfferDto,
    UpdateOfferDto
> {
    protected model = this.prisma.offer;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Override de la méthode create pour incrémenter nbOffer de l'utilisateur et nbOffers du projet
     */
    async create(createOfferDto: CreateOfferDto): Promise<Offer> {
        // Utiliser une transaction pour créer l'offre et incrémenter les compteurs
        return await this.prisma.$transaction(async (prisma) => {
            // Créer l'offre
            const newOffer = await prisma.offer.create({
                data: createOfferDto
            });

            // Incrémenter nbOffer de l'utilisateur
            await prisma.user.update({
                where: { id: createOfferDto.userId },
                data: {
                    nbOffer: {
                        increment: 1
                    }
                }
            });

            // Incrémenter nbOffers du projet
            await prisma.project.update({
                where: { id: createOfferDto.projectId },
                data: {
                    nbOffers: {
                        increment: 1
                    }
                }
            });

            return newOffer;
        });
    }

    override async remove(id: string): Promise<Offer> {
        // Utiliser une transaction pour supprimer l'offre et décrémenter les compteurs
        return await this.prisma.$transaction(async (prisma) => {
            // Récupérer l'offre pour obtenir l'userId et projectId avant suppression
            const offerToDelete = await prisma.offer.findUniqueOrThrow({
                where: { id },
                select: { userId: true, projectId: true }
            });

            // Supprimer l'offre
            const deletedOffer = await prisma.offer.delete({
                where: { id }
            });

            // Décrémenter nbOffer de l'utilisateur
            await prisma.user.update({
                where: { id: offerToDelete.userId },
                data: {
                    nbOffer: {
                        decrement: 1
                    }
                }
            });

            // Décrémenter nbOffers du projet
            await prisma.project.update({
                where: { id: offerToDelete.projectId },
                data: {
                    nbOffers: {
                        decrement: 1
                    }
                }
            });

            return deletedOffer;
        });
    }

    // Méthodes CRUD héritées du BaseService :
    // - findAll(): Promise<Offer[]>
    // - findByUser(userId: string): Promise<Offer[]>
    // - findOne(id: string): Promise<Offer>
    // - findOneOrFail(id: string): Promise<Offer>
    // - update(id: string, updateOfferDto: UpdateOfferDto): Promise<Offer>

    /**
     * Méthodes personnalisées pour les statistiques d'offres
     */
    
    /**
     * Trouve toutes les offres d'un utilisateur avec les détails du projet
     */
    async getUserOffersWithProjects(userId: string): Promise<any[]> {
        return this.prisma.offer.findMany({
            where: { userId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        logoImage: true,
                        creatorId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les offres pour un projet
     */
    async getProjectOffers(projectId: string): Promise<any[]> {
        return this.prisma.offer.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Obtient les statistiques d'offres pour un utilisateur
     */
    async getUserOfferStats(userId: string): Promise<{
        totalOffers: number;
        pendingOffers: number;
        acceptedOffers: number;
        rejectedOffers: number;
        totalAmount: number;
        averageAmount: number;
    }> {
        const [total, pending, accepted, rejected, amounts] = await Promise.all([
            this.prisma.offer.count({
                where: { userId }
            }),
            this.prisma.offer.count({
                where: { userId, status: 'PENDING' }
            }),
            this.prisma.offer.count({
                where: { userId, status: 'ACCEPTED' }
            }),
            this.prisma.offer.count({
                where: { userId, status: 'REJECTED' }
            }),
            this.prisma.offer.findMany({
                where: { userId },
                select: { amount: true }
            })
        ]);

        const totalAmount = amounts.reduce((sum, offer) => sum + offer.amount, 0);
        const averageAmount = total > 0 ? totalAmount / total : 0;

        return {
            totalOffers: total,
            pendingOffers: pending,
            acceptedOffers: accepted,
            rejectedOffers: rejected,
            totalAmount,
            averageAmount
        };
    }

    /**
     * Obtient les statistiques d'offres pour un projet
     */
    async getProjectOfferStats(projectId: string): Promise<{
        totalOffers: number;
        totalAmount: number;
        averageAmount: number;
        highestOffer: number;
    }> {
        const offers = await this.prisma.offer.findMany({
            where: { projectId },
            select: { amount: true }
        });

        const totalAmount = offers.reduce((sum, offer) => sum + offer.amount, 0);
        const totalOffers = offers.length;
        const averageAmount = totalOffers > 0 ? totalAmount / totalOffers : 0;
        const highestOffer = totalOffers > 0 ? Math.max(...offers.map(o => o.amount)) : 0;

        return {
            totalOffers,
            totalAmount,
            averageAmount,
            highestOffer
        };
    }

    // ==================== HYBRID APPROACH METHODS ====================

    /**
     * Get all offers with optimized selection (for lists)
     */
    async findAllOptimized() {
        return this.prisma.offer.findMany({
            select: {
                id: true,
                amount: true,
                offerDescription: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        logoImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get offers by user (optimized selection)
     */
    async findByUserOptimized(userId: string) {
        return this.prisma.offer.findMany({
            where: { userId },
            select: {
                id: true,
                amount: true,
                offerDescription: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        logoImage: true,
                        creator: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get offers by project (optimized selection)
     */
    async findByProjectOptimized(projectId: string) {
        return this.prisma.offer.findMany({
            where: { projectId },
            select: {
                id: true,
                amount: true,
                offerDescription: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get offers by status (optimized selection)
     */
    async findByStatusOptimized(status: StatusOffer) {
        return this.prisma.offer.findMany({
            where: { status },
            select: {
                id: true,
                amount: true,
                offerDescription: true,
                status: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        logoImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get offer summary (lightweight for dashboards)
     */
    async getOfferSummaryOptimized(userId?: string, projectId?: string) {
        const where: any = {};
        if (userId) where.userId = userId;
        if (projectId) where.projectId = projectId;

        return this.prisma.offer.findMany({
            where,
            select: {
                id: true,
                amount: true,
                status: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
    }
}
