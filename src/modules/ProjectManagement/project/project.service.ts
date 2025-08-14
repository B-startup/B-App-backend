import { Injectable } from '@nestjs/common';
import { Project, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService extends BaseCrudServiceImpl<
    Project,
    CreateProjectDto,
    UpdateProjectDto
> {
    protected model = this.prisma.project;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    /**
     * Override de la méthode create pour incrémenter nbProjects de l'utilisateur
     */
    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        // Utiliser une transaction pour créer le projet et incrémenter nbProjects
        return await this.prisma.$transaction(async (prisma) => {
            // Créer le projet
            const newProject = await prisma.project.create({
                data: createProjectDto
            });

            // Incrémenter nbProjects de l'utilisateur
            await prisma.user.update({
                where: { id: createProjectDto.creatorId },
                data: {
                    nbProjects: {
                        increment: 1
                    }
                }
            });

            return newProject;
        });
    }

    /**
     * Override de la méthode remove pour décrémenter nbProjects de l'utilisateur
     */
    async remove(id: string): Promise<Project> {
        // Utiliser une transaction pour supprimer le projet et décrémenter nbProjects
        return await this.prisma.$transaction(async (prisma) => {
            // Récupérer le projet pour obtenir le creatorId avant suppression
            const projectToDelete = await prisma.project.findUniqueOrThrow({
                where: { id },
                select: { creatorId: true }
            });

            // Supprimer le projet
            const deletedProject = await prisma.project.delete({
                where: { id }
            });

            // Décrémenter nbProjects de l'utilisateur (minimum 0)
            await prisma.user.update({
                where: { id: projectToDelete.creatorId },
                data: {
                    nbProjects: {
                        decrement: 1
                    }
                }
            });

            return deletedProject;
        });
    }

    // Méthodes CRUD héritées du BaseService :
    // - findAll(): Promise<Project[]>
    // - findByUser(userId: string): Promise<Project[]>
    // - findOne(id: string): Promise<Project>
    // - findOneOrFail(id: string): Promise<Project>
    // - update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project>
}
