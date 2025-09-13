import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Project, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
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
    private readonly projectFilesDir: string;
    private readonly maxFileSize: number;
    private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    constructor(
        protected override prisma: PrismaClient,
        private readonly configService: ConfigService
    ) {
        super(prisma);
        this.projectFilesDir = path.join(
            process.cwd(),
            this.configService.get<string>('PROJECT_FILES_DIR', 'uploads/ProjectFiles')
        );
        this.maxFileSize = parseInt(this.configService.get<string>('PROJECT_LOGO_MAX_SIZE', '2097152')); // 2MB
        this.ensureUploadDirectoryExists();
    }

    /**
     * Override findByUser to use creatorId instead of userId for projects
     */
    async findByUser(creatorId: string): Promise<Project[]> {
        return this.model.findMany({
            where: { creatorId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // ==================== OPTIMIZED METHODS ====================
    // Ces méthodes offrent de meilleures performances pour l'affichage en liste

    /**
     * Optimized version of findAll - Selective fields for better performance in list views
     */
    async findAllOptimized() {
        return this.model.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                logoImage: true,
                financialGoal: true,
                monthlyRevenue: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true
                    }
                },
                sector: {
                    select: {
                        id: true,
                        name: true
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
        });
    }

    /**
     * Optimized version of findOne - Selective fields and essential relations
     */
    async findOneOptimized(id: string) {
        const project = await this.model.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                logoImage: true,
                problem: true,
                solution: true,
                projectLocation: true,
                teamSize: true,
                customersNumber: true,
                financialGoal: true,
                monthlyRevenue: true,
                minPercentage: true,
                maxPercentage: true,
                percentageUnitPrice: true,
                status: true,
                runway: true,
                marketPlan: true,
                businessPlan: true,
                successProbability: true,
                projectStage: true,
                netProfit: true,
                nbLikes: true,
                nbComments: true,
                nbViews: true,
                nbConnects: true,
                verifiedProject: true,
                createdAt: true,
                updatedAt: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        email: true
                    }
                },
                sector: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                team: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            }
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return project;
    }

    /**
     * Optimized search - Performance focused with selective fields
     */
    async searchProjectsOptimized(query: string) {
        return this.model.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                title: true,
                description: true,
                logoImage: true,
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
                sector: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        offers: true
                    }
                }
            },
            take: 20,
            orderBy: { monthlyRevenue: 'desc' }
        });
    }

    /**
     * Optimized pagination with selective fields and metadata
     */
    async paginateOptimized(skip: number, take: number) {
        const [items, total] = await Promise.all([
            this.model.findMany({
                skip,
                take,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    logoImage: true,
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
                    sector: {
                        select: {
                            id: true,
                            name: true
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
            }),
            this.model.count()
        ]);

        return {
            items,
            total,
            skip,
            take,
            hasNext: skip + take < total,
            hasPrev: skip > 0
        };
    }

    /**
     * Get projects by creator (optimized for lists)
     */
    async findByCreatorOptimized(creatorId: string) {
        return this.model.findMany({
            where: { creatorId },
            select: {
                id: true,
                title: true,
                description: true,
                logoImage: true,
                financialGoal: true,
                monthlyRevenue: true,
                status: true,
                nbLikes: true,
                nbComments: true,
                nbViews: true,
                nbOffers: true,
                createdAt: true,
                updatedAt: true,
                sector: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                files: {
                    select: {
                        id: true,
                        fileName: true,
                        fileType: true,
                        fileUrl: true,
                        createdAt: true
                    }
                },
                offers: {
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
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                partnerships: {
                    select: {
                        id: true,
                        name: true,
                        webSite: true,
                        createdAt: true
                    }
                },
                videos: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        videoUrl: true,
                        thumbnailUrl: true,
                        duration: true,
                        nbViews: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

   
   

    // ==================== LOGO MANAGEMENT METHODS ====================

    /**
     * Créer un projet avec logo optionnel
     */
    async createWithLogo(createProjectDto: CreateProjectDto, logoFile?: Express.Multer.File): Promise<Project> {
        // Utiliser une transaction pour créer le projet et gérer le logo
        return await this.prisma.$transaction(async (prisma) => {
            let logoPath: string | undefined;

            // Préparer et nettoyer les données du projet
            const rawProjectData = {
                ...createProjectDto,
                runway: new Date(createProjectDto.runway)
            };
            const projectData = this.cleanProjectData(rawProjectData);

            // Traiter le logo si fourni
            if (logoFile) {
                // Valider le fichier
                this.validateLogoFile(logoFile);

                // Créer d'abord le projet pour obtenir l'ID
                const tempProject = await prisma.project.create({
                    data: {
                        ...projectData,
                        logoImage: 'temp' // Valeur temporaire
                    }
                });

                // Maintenant sauvegarder le logo avec l'ID du projet
                logoPath = await this.saveLogoFile(tempProject.id, logoFile);

                // Mettre à jour le projet avec le bon chemin du logo
                const updatedProject = await prisma.project.update({
                    where: { id: tempProject.id },
                    data: { logoImage: logoPath }
                });

                // Incrémenter nbProjects de l'utilisateur
                await prisma.user.update({
                    where: { id: createProjectDto.creatorId },
                    data: { nbProjects: { increment: 1 } }
                });

                return updatedProject;
            } else {
                // Créer le projet sans logo
                const newProject = await prisma.project.create({
                    data: projectData
                });

                // Incrémenter nbProjects de l'utilisateur
                await prisma.user.update({
                    where: { id: createProjectDto.creatorId },
                    data: { nbProjects: { increment: 1 } }
                });

                return newProject;
            }
        });
    }

    /**
     * Mettre à jour un projet avec logo optionnel
     */
    async updateWithLogo(id: string, updateProjectDto: UpdateProjectDto, logoFile?: Express.Multer.File): Promise<Project> {
        const existingProject = await this.model.findUnique({
            where: { id },
            select: { id: true, logoImage: true }
        });

        if (!existingProject) {
            throw new NotFoundException('Project not found');
        }

        return await this.prisma.$transaction(async (prisma) => {
            let logoPath: string | undefined = updateProjectDto.logoImage;

            // Traiter le nouveau logo si fourni
            if (logoFile) {
                // Valider le fichier
                this.validateLogoFile(logoFile);

                // Supprimer l'ancien logo s'il existe
                if (existingProject.logoImage) {
                    await this.deleteLogoFile(existingProject.logoImage);
                }

                // Sauvegarder le nouveau logo
                logoPath = await this.saveLogoFile(id, logoFile);
            }

            // Mettre à jour le projet
            return await prisma.project.update({
                where: { id },
                data: {
                    ...updateProjectDto,
                    ...(logoPath && { logoImage: logoPath })
                }
            });
        });
    }

    /**
     * Supprimer le logo d'un projet
     */
    async removeLogo(id: string): Promise<Project> {
        const project = await this.model.findUnique({
            where: { id },
            select: { id: true, logoImage: true }
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Supprimer le fichier logo s'il existe
        if (project.logoImage) {
            await this.deleteLogoFile(project.logoImage);
        }

        // Mettre à jour le projet pour supprimer la référence au logo
        return await this.model.update({
            where: { id },
            data: { logoImage: null }
        });
    }

    /**
     * Override de la méthode remove pour supprimer aussi le logo et le dossier du projet
     */
    async remove(id: string): Promise<Project> {
        return await this.prisma.$transaction(async (prisma) => {
            // Récupérer le projet avec logo et creatorId
            const projectToDelete = await prisma.project.findUniqueOrThrow({
                where: { id },
                select: { creatorId: true, logoImage: true }
            });

            // Supprimer le logo s'il existe
            if (projectToDelete.logoImage) {
                await this.deleteLogoFile(projectToDelete.logoImage);
            }

            // Supprimer le dossier complet du projet (avec tous ses fichiers)
            const projectDir = path.join(this.projectFilesDir, id);
            if (fs.existsSync(projectDir)) {
                try {
                    fs.rmSync(projectDir, { recursive: true, force: true });
                    console.log(`Project directory removed successfully: ${projectDir}`);
                } catch (error) {
                    console.warn(`Could not remove project directory ${projectDir}:`, error);
                }
            }

            // Supprimer le projet
            const deletedProject = await prisma.project.delete({
                where: { id }
            });

            // Décrémenter nbProjects de l'utilisateur
            await prisma.user.update({
                where: { id: projectToDelete.creatorId },
                data: { nbProjects: { decrement: 1 } }
            });

            return deletedProject;
        });
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Nettoyer les données du projet avant insertion/mise à jour
     */
    private cleanProjectData(projectData: any): any {
        const cleanedData = { ...projectData };
        
        Object.keys(cleanedData).forEach(key => {
            const value = cleanedData[key];
            // Supprimer les valeurs vides ou invalides
            if (value === undefined || value === null || value === '') {
                delete cleanedData[key];
            }
            // Traitement spécial pour teamId - si c'est une chaîne vide ou "undefined", le supprimer
            if (key === 'teamId' && (value === '' || value === 'undefined' || value === 'null')) {
                delete cleanedData[key];
            }
        });
        
        return cleanedData;
    }

    /**
     * Valider le fichier logo
     */
    private validateLogoFile(file: Express.Multer.File): void {
        if (file.size > this.maxFileSize) {
            throw new BadRequestException(
                `File size too large. Maximum size is ${this.maxFileSize / 1024 / 1024}MB`
            );
        }

        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`
            );
        }
    }

    /**
     * Sauvegarder le fichier logo
     */
    private async saveLogoFile(projectId: string, file: Express.Multer.File): Promise<string> {
        // Créer le dossier du projet
        const projectDir = path.join(this.projectFilesDir, projectId);
        const logoDir = path.join(projectDir, 'logo');
        
        if (!fs.existsSync(logoDir)) {
            fs.mkdirSync(logoDir, { recursive: true });
        }

        // Générer un nom de fichier unique
        const fileExtension = path.extname(file.originalname);
        const filename = `logo-${uuidv4()}${fileExtension}`;
        const fullPath = path.join(logoDir, filename);

        try {
            // Écrire le fichier
            fs.writeFileSync(fullPath, file.buffer);
            
            // Retourner le chemin relatif depuis le dossier uploads
            return `ProjectFiles/${projectId}/logo/${filename}`;
        } catch (error) {
            console.error('Failed to save logo file:', error);
            throw new BadRequestException('Failed to save logo file');
        }
    }

    /**
     * Supprimer le fichier logo
     */
    private async deleteLogoFile(logoPath: string): Promise<void> {
        if (!logoPath) return;

        try {
            // Construire le chemin complet
            const fullPath = path.join(process.cwd(), 'uploads', logoPath);
            
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        } catch (error) {
            console.warn(`Could not delete logo file ${logoPath}:`, error);
        }
    }

    /**
     * S'assurer que le dossier d'upload existe
     */
    private ensureUploadDirectoryExists(): void {
        if (!fs.existsSync(this.projectFilesDir)) {
            fs.mkdirSync(this.projectFilesDir, { recursive: true });
        }
    }
}
