import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from '../video.controller';
import { VideoService } from '../video.service';
import { CreateVideoDto, UpdateVideoDto, VideoResponseDto } from '../dto';

describe('VideoController', () => {
    let controller: VideoController;
    let service: VideoService;

    const mockVideoService = {
        create: jest.fn(),
        uploadVideo: jest.fn(),
        findAll: jest.fn(),
        findByProject: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        countByProject: jest.fn(),
    };

    const mockVideoResponse: VideoResponseDto = {
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VideoController],
            providers: [
                {
                    provide: VideoService,
                    useValue: mockVideoService,
                },
            ],
        }).compile();

        controller = module.get<VideoController>(VideoController);
        service = module.get<VideoService>(VideoService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
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

            mockVideoService.create.mockResolvedValue(mockVideoResponse);

            const result = await controller.create(createVideoDto);

            expect(service.create).toHaveBeenCalledWith(createVideoDto);
            expect(result).toEqual(mockVideoResponse);
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
                file: mockFile,
            };

            mockVideoService.uploadVideo.mockResolvedValue(mockVideoResponse);

            const result = await controller.uploadVideo(mockFile, uploadData);

            expect(service.uploadVideo).toHaveBeenCalledWith(mockFile, uploadData);
            expect(result).toEqual(mockVideoResponse);
        });
    });

    describe('findAll', () => {
        it('should return all videos', async () => {
            const mockVideos = [mockVideoResponse];
            mockVideoService.findAll.mockResolvedValue(mockVideos);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockVideos);
        });

        it('should return videos by project when projectId is provided', async () => {
            const mockVideos = [mockVideoResponse];
            const projectId = 'project-uuid-123';
            mockVideoService.findByProject.mockResolvedValue(mockVideos);

            const result = await controller.findAll(projectId);

            expect(service.findByProject).toHaveBeenCalledWith(projectId);
            expect(result).toEqual(mockVideos);
        });
    });

    describe('findByProject', () => {
        it('should return videos for a specific project', async () => {
            const mockVideos = [mockVideoResponse];
            const projectId = 'project-uuid-123';
            mockVideoService.findByProject.mockResolvedValue(mockVideos);

            const result = await controller.findByProject(projectId);

            expect(service.findByProject).toHaveBeenCalledWith(projectId);
            expect(result).toEqual(mockVideos);
        });
    });

    describe('countByProject', () => {
        it('should return video count for a project', async () => {
            const projectId = 'project-uuid-123';
            const mockCount = 5;
            mockVideoService.countByProject.mockResolvedValue(mockCount);

            const result = await controller.countByProject(projectId);

            expect(service.countByProject).toHaveBeenCalledWith(projectId);
            expect(result).toEqual({ count: mockCount });
        });
    });

    describe('findOne', () => {
        it('should return a video by id', async () => {
            const videoId = 'video-uuid-123';
            mockVideoService.findOne.mockResolvedValue(mockVideoResponse);

            const result = await controller.findOne(videoId);

            expect(service.findOne).toHaveBeenCalledWith(videoId);
            expect(result).toEqual(mockVideoResponse);
        });
    });

    describe('update', () => {
        it('should update a video', async () => {
            const videoId = 'video-uuid-123';
            const updateVideoDto: UpdateVideoDto = {
                title: 'Updated Video Title',
                description: 'Updated description',
            };

            const updatedVideo = { ...mockVideoResponse, ...updateVideoDto };
            mockVideoService.update.mockResolvedValue(updatedVideo);

            const result = await controller.update(videoId, updateVideoDto);

            expect(service.update).toHaveBeenCalledWith(videoId, updateVideoDto);
            expect(result).toEqual(updatedVideo);
        });
    });

    describe('remove', () => {
        it('should delete a video', async () => {
            const videoId = 'video-uuid-123';
            mockVideoService.remove.mockResolvedValue(undefined);

            await controller.remove(videoId);

            expect(service.remove).toHaveBeenCalledWith(videoId);
        });
    });
});
