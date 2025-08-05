import {
    Injectable,
    NotFoundException,
    BadRequestException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { File, FileType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService extends BaseCrudServiceImpl<
    File,
    CreateFileDto,
    UpdateFileDto
> {
    protected model = this.prisma.file;

    constructor(
        protected readonly prisma: PrismaService,
        private readonly configService: ConfigService
    ) {
        super(prisma);
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

        // Generate file path
        const filePath = await this.generateFilePath(
            uploadFileDto.projectId,
            file.originalname
        );

        // Ensure directory exists
        await this.ensureDirectoryExists(path.dirname(filePath));

        // Save file to disk
        await this.saveFileToDisk(file.buffer, filePath);

        // Create file record
        const createFileDto: CreateFileDto = {
            projectId: uploadFileDto.projectId,
            fileName: file.originalname,
            fileType: uploadFileDto.fileType,
            fileUrl: filePath
        };

        return this.create(createFileDto);
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

        // Remove physical file if it exists
        if (file.fileUrl && fs.existsSync(file.fileUrl)) {
            try {
                fs.unlinkSync(file.fileUrl);
            } catch (error) {
                console.warn(
                    `Failed to delete physical file: ${file.fileUrl}`,
                    error
                );
            }
        }

        return super.remove(id);
    }

    /**
     * Download file by ID
     */
    async downloadFile(
        id: string
    ): Promise<{ filePath: string; fileName: string }> {
        const file = await this.findOneOrFail(id);

        if (!file.fileUrl || !fs.existsSync(file.fileUrl)) {
            throw new NotFoundException('File not found on disk');
        }

        return {
            filePath: file.fileUrl,
            fileName: file.fileName
        };
    }

    /**
     * Get file statistics for a project
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

            // Calculate file size if file exists
            if (file.fileUrl && fs.existsSync(file.fileUrl)) {
                try {
                    const stats = fs.statSync(file.fileUrl);
                    totalSizeBytes += stats.size;
                } catch (error) {
                    console.warn(
                        `Failed to get file size for: ${file.fileUrl}`,
                        error
                    );
                }
            }
        }

        return {
            totalFiles: files.length,
            filesByType,
            totalSizeBytes
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
     * Generate file path for storage
     */
    private async generateFilePath(
        projectId: string,
        originalName: string
    ): Promise<string> {
        const baseDir = this.configService.get<string>(
            'PROJECT_FILES_DIR',
            'uploads/ProjectFiles'
        );
        const timestamp = Date.now();
        const sanitizedFileName = this.sanitizeFileName(originalName);
        const fileName = `${timestamp}_${sanitizedFileName}`;

        return path.join(baseDir, `project-${projectId}`, fileName);
    }

    /**
     * Sanitize file name
     */
    private sanitizeFileName(fileName: string): string {
        return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    /**
     * Ensure directory exists
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    /**
     * Save file to disk
     */
    private async saveFileToDisk(
        buffer: Buffer,
        filePath: string
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, buffer, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }
}
