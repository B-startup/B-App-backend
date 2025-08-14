import { Injectable } from '@nestjs/common';
import { PrismaClient, VisitorProfileProject } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateVisitorProfileProjectDto } from './dto/create-visitor-profile-project.dto';
import { UpdateVisitorProfileProjectDto } from './dto/update-visitor-profile-project.dto';

@Injectable()
export class VisitorProfileProjectService extends BaseCrudServiceImpl<
    VisitorProfileProject,
    CreateVisitorProfileProjectDto,
    UpdateVisitorProfileProjectDto
> {
    protected model = this.prisma.visitorProfileProject;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Override de la méthode create pour incrémenter nbVisits lors des visites de profil
     */
    async create(createDto: CreateVisitorProfileProjectDto): Promise<VisitorProfileProject> {
        // Utiliser une transaction pour créer la visite et incrémenter les compteurs
        return await this.prisma.$transaction(async (prisma) => {
            // Créer l'enregistrement de visite
            const newVisit = await prisma.visitorProfileProject.create({
                data: createDto
            });

            // Si c'est une visite de profil (userId existe), incrémenter nbVisits
            if (createDto.userId) {
                await prisma.user.update({
                    where: { id: createDto.userId },
                    data: {
                        nbVisits: {
                            increment: 1
                        }
                    }
                });
            }

            // Si c'est une visite de projet (projectId existe), incrémenter le compteur de vues du projet
            // Note: Le modèle Project n'a pas encore de champ pour les vues, 
            // mais on peut l'ajouter plus tard si nécessaire

            return newVisit;
        });
    }

    override async remove(id: string): Promise<VisitorProfileProject> {
        // Utiliser une transaction pour supprimer la visite et décrémenter les compteurs
        return await this.prisma.$transaction(async (prisma) => {
            // Récupérer la visite pour obtenir les IDs avant suppression
            const visitToDelete = await prisma.visitorProfileProject.findUniqueOrThrow({
                where: { id },
                select: { userId: true, projectId: true }
            });

            // Supprimer l'enregistrement de visite
            const deletedVisit = await prisma.visitorProfileProject.delete({
                where: { id }
            });

            // Si c'était une visite de profil, décrémenter nbVisits
            if (visitToDelete.userId) {
                await prisma.user.update({
                    where: { id: visitToDelete.userId },
                    data: {
                        nbVisits: {
                            decrement: 1
                        }
                    }
                });
            }

            return deletedVisit;
        });
    }

    // Méthodes CRUD héritées du BaseService :
    // - findAll(): Promise<VisitorProfileProject[]>
    // - findByUser(userId: string): Promise<VisitorProfileProject[]>
    // - findOne(id: string): Promise<VisitorProfileProject>
    // - findOneOrFail(id: string): Promise<VisitorProfileProject>
    // - update(id: string, updateDto: UpdateVisitorProfileProjectDto): Promise<VisitorProfileProject>

    /**
     * Méthodes personnalisées pour les statistiques de visite
     */
    
    /**
     * Trouve toutes les visites de profil pour un utilisateur donné
     */
    async getProfileVisits(userId: string): Promise<VisitorProfileProject[]> {
        return this.prisma.visitorProfileProject.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les visites effectuées par un utilisateur donné
     */
    async getVisitsByUser(userVisitorId: string): Promise<VisitorProfileProject[]> {
        return this.prisma.visitorProfileProject.findMany({
            where: { userVisitorId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Obtient les statistiques de visite pour un profil utilisateur
     */
    async getProfileVisitStats(userId: string): Promise<{
        totalVisits: number;
        uniqueVisitors: number;
        recentVisits: VisitorProfileProject[];
    }> {
        const [totalVisits, uniqueVisitorsResult, recentVisits] = await Promise.all([
            this.prisma.visitorProfileProject.count({
                where: { userId }
            }),
            this.prisma.visitorProfileProject.findMany({
                where: { userId },
                select: { userVisitorId: true },
                distinct: ['userVisitorId']
            }),
            this.prisma.visitorProfileProject.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        return {
            totalVisits,
            uniqueVisitors: uniqueVisitorsResult.length,
            recentVisits
        };
    }
}
