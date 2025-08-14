import { Injectable } from '@nestjs/common';
import { PrismaClient, Connect } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateConnectDto } from './dto/create-connect.dto';
import { UpdateConnectDto } from './dto/update-connect.dto';

@Injectable()
export class ConnectService extends BaseCrudServiceImpl<
    Connect,
    CreateConnectDto,
    UpdateConnectDto
> {
    protected model = this.prisma.connect;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Override de la méthode create pour incrémenter nbConnects de l'utilisateur
     */
    async create(createConnectDto: CreateConnectDto): Promise<Connect> {
        // Utiliser une transaction pour créer la connexion et incrémenter nbConnects
        return await this.prisma.$transaction(async (prisma) => {
            // Créer la demande de connexion
            const newConnect = await prisma.connect.create({
                data: createConnectDto
            });

            // Incrémenter nbConnects de l'utilisateur
            await prisma.user.update({
                where: { id: createConnectDto.userId },
                data: {
                    nbConnects: {
                        increment: 1
                    }
                }
            });

            return newConnect;
        });
    }

    override async remove(id: string): Promise<Connect> {
        // Utiliser une transaction pour supprimer la connexion et décrémenter nbConnects
        return await this.prisma.$transaction(async (prisma) => {
            // Récupérer la connexion pour obtenir l'userId avant suppression
            const connectToDelete = await prisma.connect.findUniqueOrThrow({
                where: { id },
                select: { userId: true }
            });

            // Supprimer la connexion
            const deletedConnect = await prisma.connect.delete({
                where: { id }
            });

            // Décrémenter nbConnects de l'utilisateur (minimum 0)
            await prisma.user.update({
                where: { id: connectToDelete.userId },
                data: {
                    nbConnects: {
                        decrement: 1
                    }
                }
            });

            return deletedConnect;
        });
    }

    // Méthodes CRUD héritées du BaseService :
    // - findAll(): Promise<Connect[]>
    // - findByUser(userId: string): Promise<Connect[]>
    // - findOne(id: string): Promise<Connect>
    // - findOneOrFail(id: string): Promise<Connect>
    // - update(id: string, updateConnectDto: UpdateConnectDto): Promise<Connect>

    /**
     * Méthodes personnalisées pour les statistiques de connexion
     */
    
    /**
     * Trouve toutes les connexions d'un utilisateur avec les détails du projet
     */
    async getUserConnectionsWithProjects(userId: string): Promise<any[]> {
        return this.prisma.connect.findMany({
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
     * Trouve toutes les demandes de connexion pour un projet
     */
    async getProjectConnections(projectId: string): Promise<any[]> {
        return this.prisma.connect.findMany({
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
     * Obtient les statistiques de connexion pour un utilisateur
     */
    async getUserConnectionStats(userId: string): Promise<{
        totalConnections: number;
        pendingConnections: number;
        acceptedConnections: number;
        rejectedConnections: number;
    }> {
        const [total, pending, accepted, rejected] = await Promise.all([
            this.prisma.connect.count({
                where: { userId }
            }),
            this.prisma.connect.count({
                where: { userId, connectSatus: 'PENDING' }
            }),
            this.prisma.connect.count({
                where: { userId, connectSatus: 'ACCEPTED' }
            }),
            this.prisma.connect.count({
                where: { userId, connectSatus: 'REJECTED' }
            })
        ]);

        return {
            totalConnections: total,
            pendingConnections: pending,
            acceptedConnections: accepted,
            rejectedConnections: rejected
        };
    }
}
