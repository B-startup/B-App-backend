import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from '../video.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateVideoDto, UpdateVideoDto } from '../dto';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('VideoService', () => {
    let service: VideoService;
    let prismaService: PrismaService;
    let configService: ConfigService;

    const mockPrismaService = {
        video: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        project: {
            findUnique: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    const mockVideo = {
        id: 'video-uuid-123',
        title: 'Test Video',
        description: 'Test video description',
        projectId: 'project-uuid-123',
        videoUrl: 'http://example.com/video.mp4',
        filePath: 'uploads/ProjectVideos/video.mp4',
        fileSize: 1048576,
        mimeType: 'video/mp4',
        duration: 120,
        thumbnailUrl: 'http://example.com/thumbnail.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockProject = {
        id: 'project-uuid-123',
        title: 'Test Project',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VideoService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<VideoService>(VideoService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a video', async () => {
            const createVideoDto: CreateVideoDto = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'project-uuid-123',
                duration: 120,
                thumbnailUrl: 'http://example.com/thumbnail.jpg',
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
            mockPrismaService.video.create.mockResolvedValue(mockVideo);

            const result = await service.create(createVideoDto);

            expect(prismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: createVideoDto.projectId }
            });
            expect(prismaService.video.create).toHaveBeenCalledWith({
                data: {
                    title: createVideoDto.title,
                    description: createVideoDto.description,
                    projectId: createVideoDto.projectId,
                    duration: createVideoDto.duration,
                    thumbnailUrl: createVideoDto.thumbnailUrl,
                    videoUrl: '',
                    filePath: '',
                    fileSize: 0,
                    mimeType: 'video/mp4'
                }
            });
            expect(result).toBeDefined();
            expect(result.id).toBe(mockVideo.id);
        });

        it('should throw NotFoundException when project does not exist', async () => {
            const createVideoDto: CreateVideoDto = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'non-existent-project',
                duration: 120,
                thumbnailUrl: 'http://example.com/thumbnail.jpg',
            };

            mockPrismaService.project.findUnique.mockResolvedValue(null);

            await expect(service.create(createVideoDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('uploadVideo', () => {
        it('should upload a video file', async () => {
            const mockFile = {
                buffer: Buffer.from('mock video data'),
                originalname: 'test-video.mp4',
                mimetype: 'video/mp4',
                size: 1048576,
            } as Express.Multer.File;

            const uploadData = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'project-uuid-123',
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
            mockPrismaService.video.create.mockResolvedValue(mockVideo);
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'PROJECT_VIDEOS_DIR') return 'uploads/ProjectVideos';
                if (key === 'BASE_URL') return 'http://localhost:8050/';
                return null;
            });

            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.writeFileSync.mockImplementation(() => {});

            const result = await service.uploadVideo(mockFile, uploadData);

            expect(prismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: uploadData.projectId }
            });
            expect(mockedFs.writeFileSync).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should throw BadRequestException when no file is provided', async () => {
            const uploadData = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'project-uuid-123',
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

            await expect(service.uploadVideo(null, uploadData)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when project does not exist', async () => {
            const mockFile = {
                buffer: Buffer.from('mock video data'),
                originalname: 'test-video.mp4',
                mimetype: 'video/mp4',
                size: 1048576,
            } as Express.Multer.File;

            const uploadData = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'non-existent-project',
            };

            mockPrismaService.project.findUnique.mockResolvedValue(null);

            await expect(service.uploadVideo(mockFile, uploadData)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return all videos', async () => {
            const mockVideos = [{ ...mockVideo, project: mockProject }];
            mockPrismaService.video.findMany.mockResolvedValue(mockVideos);

            const result = await service.findAll();

            expect(prismaService.video.findMany).toHaveBeenCalledWith({
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('findByProject', () => {
        it('should return videos for a specific project', async () => {
            const projectId = 'project-uuid-123';
            const mockVideos = [{ ...mockVideo, project: mockProject }];
            mockPrismaService.video.findMany.mockResolvedValue(mockVideos);

            const result = await service.findByProject(projectId);

            expect(prismaService.video.findMany).toHaveBeenCalledWith({
                where: { projectId },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('findOne', () => {
        it('should return a video by id', async () => {
            const videoId = 'video-uuid-123';
            const mockVideoWithProject = { ...mockVideo, project: mockProject };
            mockPrismaService.video.findUnique.mockResolvedValue(mockVideoWithProject);

            const result = await service.findOne(videoId);

            expect(prismaService.video.findUnique).toHaveBeenCalledWith({
                where: { id: videoId },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });
            expect(result).toBeDefined();
            expect(result.id).toBe(videoId);
        });

        it('should throw NotFoundException when video does not exist', async () => {
            const videoId = 'non-existent-video';
            mockPrismaService.video.findUnique.mockResolvedValue(null);

            await expect(service.findOne(videoId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a video', async () => {
            const videoId = 'video-uuid-123';
            const updateVideoDto: UpdateVideoDto = {
                title: 'Updated Video Title',
                description: 'Updated description',
            };

            const updatedVideo = { ...mockVideo, ...updateVideoDto, project: mockProject };
            mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
            mockPrismaService.video.update.mockResolvedValue(updatedVideo);

            const result = await service.update(videoId, updateVideoDto);

            expect(prismaService.video.findUnique).toHaveBeenCalledWith({
                where: { id: videoId }
            });
            expect(prismaService.video.update).toHaveBeenCalledWith({
                where: { id: videoId },
                data: {
                    title: updateVideoDto.title,
                    description: updateVideoDto.description,
                    projectId: updateVideoDto.projectId,
                    duration: updateVideoDto.duration,
                    thumbnailUrl: updateVideoDto.thumbnailUrl
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            });
            expect(result.title).toBe(updateVideoDto.title);
        });

        it('should throw NotFoundException when video does not exist', async () => {
            const videoId = 'non-existent-video';
            const updateVideoDto: UpdateVideoDto = {
                title: 'Updated Video Title',
            };

            mockPrismaService.video.findUnique.mockResolvedValue(null);

            await expect(service.update(videoId, updateVideoDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete a video', async () => {
            const videoId = 'video-uuid-123';
            mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
            mockPrismaService.video.delete.mockResolvedValue(mockVideo);
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.unlinkSync.mockImplementation(() => {});

            await service.remove(videoId);

            expect(prismaService.video.findUnique).toHaveBeenCalledWith({
                where: { id: videoId }
            });
            expect(mockedFs.unlinkSync).toHaveBeenCalledWith(mockVideo.filePath);
            expect(prismaService.video.delete).toHaveBeenCalledWith({
                where: { id: videoId }
            });
        });

        it('should throw NotFoundException when video does not exist', async () => {
            const videoId = 'non-existent-video';
            mockPrismaService.video.findUnique.mockResolvedValue(null);

            await expect(service.remove(videoId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('countByProject', () => {
        it('should return video count for a project', async () => {
            const projectId = 'project-uuid-123';
            const mockCount = 5;
            mockPrismaService.video.count.mockResolvedValue(mockCount);

            const result = await service.countByProject(projectId);

            expect(prismaService.video.count).toHaveBeenCalledWith({
                where: { projectId }
            });
            expect(result).toBe(mockCount);
        });
    });
});
