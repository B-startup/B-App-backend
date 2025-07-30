import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseService } from '../../../core/services/base.service';
import { CreateProjectTagDto } from './dto/create-project-tag.dto';
import { UpdateProjectTagDto } from './dto/update-project-tag.dto';
import { ProjectTag } from '@prisma/client';

@Injectable()
export class ProjectTagService extends BaseService<
    ProjectTag,
    CreateProjectTagDto,
    UpdateProjectTagDto
> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.projectTag, 'ProjectTag');
    }

    /**
     * Vérifie si une association project-tag existe déjà
     */
    async hasProjectTagAssociation(projectId: string, tagId: string): Promise<boolean> {
        const existingAssociation = await this.prisma.projectTag.findFirst({
            where: {
                projectId,
                tagId
            }
        });
        return !!existingAssociation;
    }

    /**
     * Crée une association project-tag avec vérification d'unicité
     */
    async createAssociation(createProjectTagDto: CreateProjectTagDto): Promise<ProjectTag> {
        const { projectId, tagId } = createProjectTagDto;

        // Vérifier si l'association existe déjà
        const alreadyExists = await this.hasProjectTagAssociation(projectId, tagId);
        if (alreadyExists) {
            throw new ConflictException('This project is already associated with this tag');
        }

        // Vérifier que le projet existe
        const project = await this.prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Vérifier que le tag existe
        const tag = await this.prisma.tag.findUnique({
            where: { id: tagId }
        });
        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return this.create(createProjectTagDto);
    }

    /**
     * Trouve toutes les associations d'un projet spécifique
     */
    async findByProject(projectId: string): Promise<ProjectTag[]> {
        return this.prisma.projectTag.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un tag spécifique
     */
    async findByTag(tagId: string): Promise<ProjectTag[]> {
        return this.prisma.projectTag.findMany({
            where: { tagId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouve toutes les associations d'un projet avec les détails du tag
     */
    async findByProjectWithTags(projectId: string): Promise<any[]> {
        return this.prisma.projectTag.findMany({
            where: { projectId },
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
     * Trouve toutes les associations d'un tag avec les détails du projet
     */
    async findByTagWithProjects(tagId: string): Promise<any[]> {
        return this.prisma.projectTag.findMany({
            where: { tagId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        logoImage: true,
                        projectStage: true,
                        financialGoal: true,
                        nbLikes: true,
                        nbViews: true,
                        verifiedProject: true,
                        createdAt: true,
                        creator: {
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
     * Supprime une association project-tag spécifique
     */
    async removeAssociation(projectId: string, tagId: string): Promise<ProjectTag> {
        const existingAssociation = await this.prisma.projectTag.findFirst({
            where: {
                projectId,
                tagId
            }
        });

        if (!existingAssociation) {
            throw new NotFoundException('Project-tag association not found');
        }

        return this.remove(existingAssociation.id);
    }

    /**
     * Ajoute plusieurs tags à un projet
     */
    async addMultipleTagsToProject(projectId: string, tagIds: string[]): Promise<ProjectTag[]> {
        // Vérifier que le projet existe
        const project = await this.prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            throw new NotFoundException('Project not found');
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
        const results: ProjectTag[] = [];
        for (const tagId of tagIds) {
            const exists = await this.hasProjectTagAssociation(projectId, tagId);
            if (!exists) {
                const association = await this.create({ projectId, tagId });
                results.push(association);
            }
        }

        return results;
    }

    /**
     * Compte le nombre d'associations pour un projet
     */
    async countByProject(projectId: string): Promise<number> {
        return this.prisma.projectTag.count({
            where: { projectId }
        });
    }

    /**
     * Compte le nombre d'associations pour un tag
     */
    async countByTag(tagId: string): Promise<number> {
        return this.prisma.projectTag.count({
            where: { tagId }
        });
    }

    /**
     * Trouve tous les tags populaires (avec le plus de projets)
     */
    async findPopularTags(limit: number = 10): Promise<any[]> {
        const tagCounts = await this.prisma.projectTag.groupBy({
            by: ['tagId'],
            _count: {
                projectId: true
            },
            orderBy: {
                _count: {
                    projectId: 'desc'
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
                projectCount: count._count.projectId
            };
        });
    }

    /**
     * Trouve les projets similaires basés sur les tags partagés
     */
    async findSimilarProjects(projectId: string, limit: number = 5): Promise<any[]> {
        // Récupérer les tags du projet
        const projectTags = await this.findByProject(projectId);
        const tagIds = projectTags.map(pt => pt.tagId);

        if (tagIds.length === 0) {
            return [];
        }

        // Trouver les projets qui partagent au moins un tag
        const similarProjects = await this.prisma.projectTag.findMany({
            where: {
                tagId: {
                    in: tagIds
                },
                projectId: {
                    not: projectId // Exclure le projet original
                }
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        logoImage: true,
                        projectStage: true,
                        financialGoal: true,
                        nbLikes: true,
                        nbViews: true,
                        verifiedProject: true,
                        createdAt: true,
                        creator: {
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
        const uniqueProjects = Array.from(
            new Map(similarProjects.map(item => [item.projectId, item.project])).values()
        ).slice(0, limit);

        return uniqueProjects;
    }
}
