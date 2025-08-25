import { Injectable, NotFoundException } from '@nestjs/common';
import { Sector, PrismaClient, Status } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorService extends BaseCrudServiceImpl<
    Sector,
    CreateSectorDto,
    UpdateSectorDto
> {
    protected model = this.prisma.sector;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    // ==================== HYBRID APPROACH METHODS ====================
    // Optimized methods for simple cases (direct Prisma selection)
    // Complex methods with business logic use full relations

    /**
     * Get all sectors with optimized selection (for lists/dropdowns)
     */
    async findAllOptimized() {
        return this.model.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                _count: {
                    select: {
                        projects: true,
                        PostSector: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    
    /**
     * Get sector with detailed information (complex case)
     */
    async findOneDetailed(id: string) {
        const sector = await this.model.findUnique({
            where: { id },
            include: {
                projects: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        financialGoal: true,
                        monthlyRevenue: true,
                        status: true,
                        createdAt: true,
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                profilePicture: true
                            }
                        },
                        _count: {
                            select: {
                                likes: true,
                                comments: true,
                                offers: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                PostSector: {
                    select: {
                        post: {
                            select: {
                                id: true,
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
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        projects: true,
                        PostSector: true
                    }
                }
            }
        });

        if (!sector) {
            throw new NotFoundException('Sector not found');
        }

        return sector;
    }

    /**
     * Search sectors by name (optimized for search)
     */
    async searchSectorsOptimized(query: string) {
        return this.model.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: {
                        projects: true
                    }
                }
            },
            orderBy: { name: 'asc' },
            take: 20
        });
    }


 

    /**
     * Get sector statistics
     */
    async getSectorStats(id: string) {
        const stats = await this.model.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                _count: {
                    select: {
                        projects: true,
                        PostSector: true
                    }
                },
                projects: {
                    select: {
                        financialGoal: true,
                        monthlyRevenue: true,
                        status: true
                    }
                }
            }
        });

        if (!stats) {
            throw new NotFoundException('Sector not found');
        }

        // Calculate financial stats
        const totalFundingGoal = stats.projects.reduce((sum, project) => sum + (project.financialGoal || 0), 0);
        const totalRevenue = stats.projects.reduce((sum, project) => sum + (project.monthlyRevenue || 0), 0);
        const publicProjects = stats.projects.filter(p => p.status === Status.PUBLIC).length;

        return {
            id: stats.id,
            name: stats.name,
            totalProjects: stats._count.projects,
            totalPosts: stats._count.PostSector,
            totalFundingGoal,
            totalRevenue,
            publicProjects,
            averageFundingGoal: stats._count.projects > 0 ? totalFundingGoal / stats._count.projects : 0
        };
    }
}
