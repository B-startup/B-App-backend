import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FileService } from '../file.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { FileType } from '@prisma/client';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('FileService', () => {
    let service: FileService;

    const mockPrismaService = {
        file: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        project: {
            findUnique: jest.fn()
        }
    };

    const mockConfigService = {
        get: jest.fn()
    };

    const mockProject = {
        id: 'project-123',
        title: 'Test Project',
        creatorId: 'user-123'
    };

    const mockFile = {
        id: 'file-123',
        projectId: 'project-123',
        fileName: 'test.pdf',
        fileType: FileType.PDF,
        fileUrl: 'uploads/ProjectFiles/project-123/test.pdf',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ]
        }).compile();

        service = module.get<FileService>(FileService);

        // Reset mocks
        jest.clearAllMocks();

        // Setup default mock returns
        mockConfigService.get.mockImplementation(
            (key: string, defaultValue?: any) => {
                const config = {
                    PROJECT_FILES_DIR: 'uploads/ProjectFiles',
                    PROJECT_FILES_MAX_SIZE: 10485760
                };
                return config[key] || defaultValue;
            }
        );
    });

    describe('create', () => {
        it('should create a file record when project exists', async () => {
            // Arrange
            const createFileDto = {
                projectId: 'project-123',
                fileName: 'test.pdf',
                fileType: FileType.PDF,
                fileUrl: 'uploads/ProjectFiles/project-123/test.pdf'
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
            mockPrismaService.file.create.mockResolvedValue(mockFile);

            // Act
            const result = await service.create(createFileDto);

            // Assert
            expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: 'project-123' }
            });
            expect(mockPrismaService.file.create).toHaveBeenCalledWith({
                data: createFileDto
            });
            expect(result).toEqual(mockFile);
        });

        it('should throw NotFoundException when project does not exist', async () => {
            // Arrange
            const createFileDto = {
                projectId: 'non-existent-project',
                fileName: 'test.pdf',
                fileType: FileType.PDF,
                fileUrl: 'uploads/ProjectFiles/project-123/test.pdf'
            };

            mockPrismaService.project.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.create(createFileDto)).rejects.toThrow(
                new NotFoundException(
                    'Project with ID non-existent-project not found'
                )
            );
        });
    });

    describe('uploadFile', () => {
        const mockUploadedFile: Express.Multer.File = {
            fieldname: 'file',
            originalname: 'test.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            buffer: Buffer.from('test file content'),
            size: 1024,
            stream: null,
            destination: '',
            filename: '',
            path: ''
        };

        beforeEach(() => {
            // Mock file system operations
            mockFs.existsSync.mockReturnValue(false);
            mockFs.mkdirSync.mockImplementation();
            mockFs.writeFile.mockImplementation((path, data, callback) => {
                callback(null);
            });
        });

        it('should upload file and create record successfully', async () => {
            // Arrange
            const uploadFileDto = {
                projectId: 'project-123',
                fileType: FileType.PDF,
                file: mockUploadedFile
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
            mockPrismaService.file.create.mockResolvedValue(mockFile);

            // Act
            const result = await service.uploadFile(
                uploadFileDto,
                mockUploadedFile
            );

            // Assert
            expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: 'project-123' }
            });
            expect(mockFs.mkdirSync).toHaveBeenCalled();
            expect(mockFs.writeFile).toHaveBeenCalled();
            expect(result).toEqual(mockFile);
        });

        it('should throw BadRequestException for invalid file type', async () => {
            // Arrange
            const invalidFile = {
                ...mockUploadedFile,
                mimetype: 'text/plain' // Invalid for PDF
            };

            const uploadFileDto = {
                projectId: 'project-123',
                fileType: FileType.PDF,
                file: invalidFile
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

            // Act & Assert
            await expect(
                service.uploadFile(uploadFileDto, invalidFile)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException for file size exceeding limit', async () => {
            // Arrange
            const largeFile = {
                ...mockUploadedFile,
                size: 20 * 1024 * 1024 // 20MB, exceeds 10MB limit
            };

            const uploadFileDto = {
                projectId: 'project-123',
                fileType: FileType.PDF,
                file: largeFile
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

            // Act & Assert
            await expect(
                service.uploadFile(uploadFileDto, largeFile)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('findByProject', () => {
        it('should return files for a specific project', async () => {
            // Arrange
            const projectFiles = [mockFile];
            mockPrismaService.file.findMany.mockResolvedValue(projectFiles);

            // Act
            const result = await service.findByProject('project-123');

            // Assert
            expect(mockPrismaService.file.findMany).toHaveBeenCalledWith({
                where: { projectId: 'project-123' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(projectFiles);
        });
    });

    describe('update', () => {
        it('should update file record successfully', async () => {
            // Arrange
            const updateFileDto = {
                fileName: 'updated-test.pdf'
            };

            mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
            mockPrismaService.file.update.mockResolvedValue({
                ...mockFile,
                fileName: 'updated-test.pdf'
            });

            // Act
            const result = await service.update('file-123', updateFileDto);

            // Assert
            expect(mockPrismaService.file.findUnique).toHaveBeenCalledWith({
                where: { id: 'file-123' }
            });
            expect(mockPrismaService.file.update).toHaveBeenCalledWith({
                where: { id: 'file-123' },
                data: updateFileDto
            });
            expect(result).toEqual({
                ...mockFile,
                fileName: 'updated-test.pdf'
            });
        });

        it('should verify new project exists when projectId is updated', async () => {
            // Arrange
            const updateFileDto = {
                projectId: 'new-project-123'
            };

            const newProject = { ...mockProject, id: 'new-project-123' };

            mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
            mockPrismaService.project.findUnique.mockResolvedValue(newProject);
            mockPrismaService.file.update.mockResolvedValue({
                ...mockFile,
                projectId: 'new-project-123'
            });

            // Act
            const result = await service.update('file-123', updateFileDto);

            // Assert
            expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: 'new-project-123' }
            });
            expect(result).toEqual({
                ...mockFile,
                projectId: 'new-project-123'
            });
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            mockFs.existsSync.mockReturnValue(true);
            mockFs.unlinkSync.mockImplementation();
        });

        it('should remove file record and physical file', async () => {
            // Arrange
            mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
            mockPrismaService.file.delete.mockResolvedValue(mockFile);

            // Act
            const result = await service.remove('file-123');

            // Assert
            expect(mockFs.existsSync).toHaveBeenCalledWith(mockFile.fileUrl);
            expect(mockFs.unlinkSync).toHaveBeenCalledWith(mockFile.fileUrl);
            expect(mockPrismaService.file.delete).toHaveBeenCalledWith({
                where: { id: 'file-123' }
            });
            expect(result).toEqual(mockFile);
        });

        it('should handle missing physical file gracefully', async () => {
            // Arrange
            mockFs.existsSync.mockReturnValue(false);
            mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
            mockPrismaService.file.delete.mockResolvedValue(mockFile);

            // Act
            const result = await service.remove('file-123');

            // Assert
            expect(mockFs.unlinkSync).not.toHaveBeenCalled();
            expect(result).toEqual(mockFile);
        });
    });

    describe('downloadFile', () => {
        it('should return file path and name for existing file', async () => {
            // Arrange
            mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
            mockFs.existsSync.mockReturnValue(true);

            // Act
            const result = await service.downloadFile('file-123');

            // Assert
            expect(result).toEqual({
                filePath: mockFile.fileUrl,
                fileName: mockFile.fileName
            });
        });

        it('should throw NotFoundException when physical file does not exist', async () => {
            // Arrange
            mockPrismaService.file.findUnique.mockResolvedValue(mockFile);
            mockFs.existsSync.mockReturnValue(false);

            // Act & Assert
            await expect(service.downloadFile('file-123')).rejects.toThrow(
                new NotFoundException('File not found on disk')
            );
        });
    });

    describe('getProjectFileStats', () => {
        it('should return project file statistics', async () => {
            // Arrange
            const projectFiles = [
                { ...mockFile, fileType: FileType.PDF },
                { ...mockFile, id: 'file-456', fileType: FileType.PNG },
                { ...mockFile, id: 'file-789', fileType: FileType.PDF }
            ];

            mockPrismaService.file.findMany.mockResolvedValue(projectFiles);
            mockFs.existsSync.mockReturnValue(true);
            mockFs.statSync.mockReturnValue({ size: 1024 } as any);

            // Act
            const result = await service.getProjectFileStats('project-123');

            // Assert
            expect(result).toEqual({
                totalFiles: 3,
                filesByType: {
                    PDF: 2,
                    PNG: 1,
                    JPG: 0,
                    PPT: 0
                },
                totalSizeBytes: 3072 // 3 * 1024
            });
        });
    });
});
