import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/services/prisma.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { File, FileType } from '@prisma/client';

@Injectable()
export class FileService extends BaseCrudServiceImpl<
    File,
    CreateFileDto,
    UpdateFileDto
> {
    protected model = this.prisma.file;
    private readonly maxFileSize: number;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly cloudinaryService: CloudinaryService
    ) {
        super(prisma);
        this.maxFileSize = parseInt(this.configService.get<string>('FILE_MAX_SIZE', '52428800')); // 50MB
    }

    /**
     * Create a new file record
     */
    async create(createFileDto: CreateFileDto): Promise<File> {
        // Verify project exists
        const project = await this.prisma.project.findUnique({
            where: { id: createFileDto.projectId }
        });

        if (!project) {
            throw new NotFoundException(
                `Project with ID ${createFileDto.projectId} not found`
            );
        }

        return super.create(createFileDto);
    }

    /**
     * Upload a file and create the record
     */
    async uploadFile(
        uploadFileDto: UploadFileDto,
        file: Express.Multer.File
    ): Promise<File> {
        // Verify project exists
        const project = await this.prisma.project.findUnique({
            where: { id: uploadFileDto.projectId }
        });

        if (!project) {
            throw new NotFoundException(
                `Project with ID ${uploadFileDto.projectId} not found`
            );
        }

        // Validate file type
        this.validateFileType(file, uploadFileDto.fileType);

        // Validate file size
        this.validateFileSize(file);

        try {
            console.log('☁️  Upload du document vers Cloudinary...');
            // Upload vers Cloudinary
            const cloudinaryResult = await this.cloudinaryService.uploadDocument(
                file, 
                uploadFileDto.projectId, 
                project.creatorId
            );
            
            console.log('✅ Document uploadé avec succès:', cloudinaryResult.secure_url);

            // Create file record avec URL Cloudinary
            const createFileDto: CreateFileDto = {
                projectId: uploadFileDto.projectId,
                fileName: file.originalname,
                fileType: uploadFileDto.fileType,
                fileUrl: cloudinaryResult.secure_url
            };

            return this.create(createFileDto);
        } catch (error) {
            console.error('❌ Erreur lors de l\'upload vers Cloudinary:', error);
            throw new BadRequestException('Erreur lors de l\'upload du document vers Cloudinary');
        }
    }

    /**
     * Find all files for a specific project
     */
    async findByProject(projectId: string): Promise<File[]> {
        return this.prisma.file.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Update file record
     */
    async update(id: string, updateFileDto: UpdateFileDto): Promise<File> {
        // Check if file exists
        const existingFile = await this.findOneOrFail(id);

        // If projectId is being updated, verify new project exists
        if (
            updateFileDto.projectId &&
            updateFileDto.projectId !== existingFile.projectId
        ) {
            const project = await this.prisma.project.findUnique({
                where: { id: updateFileDto.projectId }
            });

            if (!project) {
                throw new NotFoundException(
                    `Project with ID ${updateFileDto.projectId} not found`
                );
            }
        }

        return super.update(id, updateFileDto);
    }

    /**
     * Remove file record and physical file
     */
    async remove(id: string): Promise<File> {
        const file = await this.findOneOrFail(id);

        console.log('🗑️  Suppression du fichier:', id);
        console.log('📁 URL du fichier:', file.fileUrl || 'Aucune');

        // Supprimer le fichier de Cloudinary s'il existe
        if (file.fileUrl) {
            try {
                if (this.isCloudinaryUrl(file.fileUrl)) {
                    console.log('☁️  Suppression du fichier Cloudinary...');
                    const publicId = this.cloudinaryService.extractPublicIdFromUrl(file.fileUrl);
                    if (publicId) {
                        // Déterminer le type de ressource basé sur l'URL ou le type de fichier
                        const resourceType = this.determineResourceType(file.fileUrl, file.fileType);
                        await this.cloudinaryService.deleteFile(publicId, resourceType);
                        console.log('✅ Fichier Cloudinary supprimé avec succès');
                    }
                } else {
                    // Ancien fichier local - log uniquement
                    console.warn('⚠️  Fichier local détecté mais non supprimé (migration Cloudinary requise):', file.fileUrl);
                }
            } catch (error) {
                console.warn(`❌ Erreur lors de la suppression du fichier: ${file.fileUrl}`, error);
            }
        }

        const deletedFile = await super.remove(id);
        console.log('✅ Fichier supprimé avec succès:', id);
        return deletedFile;
    }

    /**
     * Download file by ID (Cloudinary URL)
     */
    async downloadFile(
        id: string
    ): Promise<{ filePath: string; fileName: string }> {
        const file = await this.findOneOrFail(id);

        if (!file.fileUrl) {
            throw new NotFoundException('File URL not found');
        }

        // Pour Cloudinary, on retourne directement l'URL sécurisée
        return {
            filePath: file.fileUrl,
            fileName: file.fileName
        };
    }

    /**
     * Get file statistics for a project (Cloudinary version)
     */
    async getProjectFileStats(projectId: string): Promise<{
        totalFiles: number;
        filesByType: Record<FileType, number>;
        totalSizeBytes: number;
    }> {
        const files = await this.findByProject(projectId);

        let totalSizeBytes = 0;
        const filesByType: Record<FileType, number> = {
            PDF: 0,
            PNG: 0,
            JPG: 0,
            PPT: 0
        };

        for (const file of files) {
            filesByType[file.fileType]++;
            // Note: Pour Cloudinary, la taille des fichiers peut être récupérée via l'API Cloudinary si nécessaire
            // Pour l'instant, on ne calcule pas la taille totale
        }

        return {
            totalFiles: files.length,
            filesByType,
            totalSizeBytes // Sera 0 pour Cloudinary, peut être étendu avec l'API Cloudinary
        };
    }

    // ==================== HYBRID APPROACH METHODS ====================
    // Optimized methods for simple cases (direct Prisma selection)
    // Complex methods with business logic use full relations

    /**
     * Get all files with optimized selection (for lists)
     */
    async findAllOptimized() {
        return this.model.findMany({
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileUrl: true,
                createdAt: true,
                updatedAt: true,
                project: {
                    select: {
                        id: true,
                        title: true,
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
     * Get files by project (optimized selection)
     */
    async findByProjectOptimized(projectId: string) {
        return this.model.findMany({
            where: { projectId },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileUrl: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get files by type (optimized selection)
     */
    async findByTypeOptimized(fileType: FileType) {
        return this.model.findMany({
            where: { fileType },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileUrl: true,
                createdAt: true,
                project: {
                    select: {
                        id: true,
                        title: true,
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
     * Search files by name (optimized selection)
     */
    async searchFilesOptimized(query: string) {
        return this.model.findMany({
            where: {
                fileName: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileUrl: true,
                createdAt: true,
                project: {
                    select: {
                        id: true,
                        title: true,
                        creator: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }

    /**
     * Get file with detailed information (Cloudinary version)
     */
    async findOneDetailed(id: string) {
        const file = await this.model.findUnique({
            where: { id },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
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
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!file) {
            throw new NotFoundException('File not found');
        }

        // Pour Cloudinary, la taille peut être récupérée via l'API si nécessaire
        // Pour l'instant, on retourne 0 ou on peut étendre avec l'API Cloudinary
        const fileSize = 0;

        return {
            ...file,
            fileSize
        };
    }

    
    /**
     * Validate file type matches expected type
     */
    private validateFileType(
        file: Express.Multer.File,
        expectedType: FileType
    ): void {
        const mimeTypeMap: Record<FileType, string[]> = {
            PDF: ['application/pdf'],
            PNG: ['image/png'],
            JPG: ['image/jpeg', 'image/jpg'],
            PPT: [
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ]
        };

        const allowedMimeTypes = mimeTypeMap[expectedType];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid file type. Expected ${expectedType}, got ${file.mimetype}`
            );
        }
    }

    /**
     * Validate file size
     */
    private validateFileSize(file: Express.Multer.File): void {
        const maxSize = this.configService.get<number>(
            'PROJECT_FILES_MAX_SIZE',
            10485760
        ); // 10MB default

        if (file.size > maxSize) {
            throw new BadRequestException(
                `File size exceeds maximum allowed size of ${maxSize} bytes`
            );
        }
    }



    /**
     * Vérifie si une URL est une URL Cloudinary
     */
    private isCloudinaryUrl(url: string): boolean {
        return url?.includes('cloudinary.com') ?? false;
    }

    /**
     * Détermine le type de ressource Cloudinary basé sur l'URL et le type de fichier
     */
    private determineResourceType(fileUrl: string, fileType: FileType): 'image' | 'video' | 'raw' {
        // Si l'URL contient déjà le type, l'utiliser
        if (fileUrl.includes('/video/upload/')) return 'video';
        if (fileUrl.includes('/raw/upload/')) return 'raw'; // Fichiers PPT et anciens raw
        
        // Logique basée sur le type de fichier :
        // PPT doit être 'raw' (obligatoire car ZIP), autres peuvent être 'image'
        return fileType === FileType.PPT ? 'raw' : 'image';
    }
}
