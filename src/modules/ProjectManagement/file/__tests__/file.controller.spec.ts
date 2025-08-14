import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { FileController } from '../file.controller';
import { FileService } from '../file.service';
import { FileType, User } from '@prisma/client';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';
import { ResourceOwnerGuard } from '../../../../core/common/guards/resource-owner.guard';

describe('FileController', () => {
    let controller: FileController;

    const mockFileService = {
        create: jest.fn(),
        uploadFile: jest.fn(),
        findAll: jest.fn(),
        findByProject: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        downloadFile: jest.fn(),
        getProjectFileStats: jest.fn()
    };

    const mockTokenBlacklistGuard = {
        canActivate: jest.fn(() => true)
    };

    const mockResourceOwnerGuard = {
        canActivate: jest.fn(() => true)
    };

    const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'User',
        isEmailVerified: true,
        isCompleteProfile: true,
        isPhoneVerified: false,
        score: 0,
        nbPosts: 0,
        nbConnects: 0,
        nbFollowers: 0,
        nbFollowing: 0,
        timeSpent: 0,
        nbVisits: 0,
        nbProjects: 0,
        nbOffer: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogoutAt: null,
        otpCode: null,
        otpCodeExpiresAt: null,
        description: null,
        country: null,
        city: null,
        birthdate: null,
        phone: null,
        profilePicture: null,
        webSite: null,
        CIN: null,
        passport: null
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FileController],
            providers: [
                {
                    provide: FileService,
                    useValue: mockFileService
                }
            ]
        })
            .overrideGuard(TokenBlacklistGuard)
            .useValue(mockTokenBlacklistGuard)
            .overrideGuard(ResourceOwnerGuard)
            .useValue(mockResourceOwnerGuard)
            .compile();

        controller = module.get<FileController>(FileController);

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a file record', async () => {
            // Arrange
            const createFileDto = {
                projectId: 'project-123',
                fileName: 'test.pdf',
                fileType: FileType.PDF,
                fileUrl: 'uploads/ProjectFiles/project-123/test.pdf'
            };

            mockFileService.create.mockResolvedValue(mockFile);

            // Act
            const result = await controller.create(createFileDto, mockUser);

            // Assert
            expect(mockFileService.create).toHaveBeenCalledWith(createFileDto);
            expect(result).toEqual(mockFile);
        });
    });

    describe('uploadFile', () => {
        it('should upload file and create record', async () => {
            // Arrange
            const uploadFileDto = {
                projectId: 'project-123',
                fileType: FileType.PDF,
                file: mockUploadedFile
            };

            mockFileService.uploadFile.mockResolvedValue(mockFile);

            // Act
            const result = await controller.uploadFile(
                uploadFileDto,
                mockUploadedFile,
                mockUser
            );

            // Assert
            expect(mockFileService.uploadFile).toHaveBeenCalledWith(
                uploadFileDto,
                mockUploadedFile
            );
            expect(result).toEqual(mockFile);
        });

        it('should throw BadRequestException when file is missing', async () => {
            // Arrange
            const uploadFileDto = {
                projectId: 'project-123',
                fileType: FileType.PDF,
                file: mockUploadedFile
            };

            // Act & Assert
            await expect(
                controller.uploadFile(uploadFileDto, null, mockUser)
            ).rejects.toThrow(new BadRequestException('File is required'));
        });
    });

    describe('findAll', () => {
        it('should return all files when no projectId is provided', async () => {
            // Arrange
            const files = [mockFile];
            mockFileService.findAll.mockResolvedValue(files);

            // Act
            const result = await controller.findAll(mockUser);

            // Assert
            expect(mockFileService.findAll).toHaveBeenCalled();
            expect(result).toEqual(files);
        });

        it('should return project files when projectId is provided', async () => {
            // Arrange
            const files = [mockFile];
            mockFileService.findByProject.mockResolvedValue(files);

            // Act
            const result = await controller.findAll(mockUser, 'project-123');

            // Assert
            expect(mockFileService.findByProject).toHaveBeenCalledWith(
                'project-123'
            );
            expect(result).toEqual(files);
        });
    });

    describe('findByProject', () => {
        it('should return files for a specific project', async () => {
            // Arrange
            const files = [mockFile];
            mockFileService.findByProject.mockResolvedValue(files);

            // Act
            const result = await controller.findByProject(
                'project-123',
                mockUser
            );

            // Assert
            expect(mockFileService.findByProject).toHaveBeenCalledWith(
                'project-123'
            );
            expect(result).toEqual(files);
        });
    });

    describe('getProjectStats', () => {
        it('should return project file statistics', async () => {
            // Arrange
            const stats = {
                totalFiles: 3,
                filesByType: {
                    PDF: 2,
                    PNG: 1,
                    JPG: 0,
                    PPT: 0
                },
                totalSizeBytes: 3072
            };

            mockFileService.getProjectFileStats.mockResolvedValue(stats);

            // Act
            const result = await controller.getProjectStats(
                'project-123',
                mockUser
            );

            // Assert
            expect(mockFileService.getProjectFileStats).toHaveBeenCalledWith(
                'project-123'
            );
            expect(result).toEqual(stats);
        });
    });

    describe('findOne', () => {
        it('should return a file by ID', async () => {
            // Arrange
            mockFileService.findOne.mockResolvedValue(mockFile);

            // Act
            const result = await controller.findOne('file-123', mockUser);

            // Assert
            expect(mockFileService.findOne).toHaveBeenCalledWith('file-123');
            expect(result).toEqual(mockFile);
        });
    });

    describe('downloadFile', () => {
        it('should download a file', async () => {
            // Arrange
            const downloadInfo = {
                filePath: '/path/to/file.pdf',
                fileName: 'test.pdf'
            };

            const mockResponse = {
                setHeader: jest.fn(),
                pipe: jest.fn()
            } as unknown as Response;

            // Mock the fs.createReadStream to return a mock stream
            const mockStream = {
                pipe: jest.fn()
            };

            const fs = await import('fs');
            jest.spyOn(fs, 'createReadStream').mockReturnValue(
                mockStream as any
            );

            mockFileService.downloadFile.mockResolvedValue(downloadInfo);

            // Act
            await controller.downloadFile('file-123', mockResponse, mockUser);

            // Assert
            expect(mockFileService.downloadFile).toHaveBeenCalledWith(
                'file-123'
            );
            expect(mockResponse.setHeader).toHaveBeenCalledWith(
                'Content-Disposition',
                'attachment; filename="test.pdf"'
            );
            expect(mockResponse.setHeader).toHaveBeenCalledWith(
                'Content-Type',
                'application/octet-stream'
            );
            expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
        });
    });

    describe('update', () => {
        it('should update a file record', async () => {
            // Arrange
            const updateFileDto = {
                fileName: 'updated-test.pdf'
            };

            const updatedFile = {
                ...mockFile,
                fileName: 'updated-test.pdf'
            };

            mockFileService.update.mockResolvedValue(updatedFile);

            // Act
            const result = await controller.update(
                'file-123',
                updateFileDto,
                mockUser
            );

            // Assert
            expect(mockFileService.update).toHaveBeenCalledWith(
                'file-123',
                updateFileDto
            );
            expect(result).toEqual(updatedFile);
        });
    });

    describe('remove', () => {
        it('should remove a file record', async () => {
            // Arrange
            mockFileService.remove.mockResolvedValue(mockFile);

            // Act
            const result = await controller.remove('file-123', mockUser);

            // Assert
            expect(mockFileService.remove).toHaveBeenCalledWith('file-123');
            expect(result).toEqual(mockFile);
        });
    });
});
