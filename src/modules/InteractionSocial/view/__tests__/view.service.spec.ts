import { Test, TestingModule } from '@nestjs/testing';
import { ViewService } from '../view.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CounterService } from '../../../../core/common/services/counter.service';
import { NotFoundException } from '@nestjs/common';
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';

describe('ViewService', () => {
    let service: ViewService;
    let mockPrismaService: jest.Mocked<PrismaService>;
    let mockCounterService: jest.Mocked<CounterService>;

    const mockView = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        videoId: '123e4567-e89b-12d3-a456-426614174002',
        timespent: 120,
        createdAt: new Date('2025-07-31T10:00:00.000Z'),
        updatedAt: new Date('2025-07-31T10:00:00.000Z')
    };

    const mockVideo = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        projectId: '123e4567-e89b-12d3-a456-426614174003',
        title: 'Test Video',
        videoUrl: 'https://example.com/video.mp4',
        description: 'Test video description',
        nbViews: 5,
        userId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: new Date('2025-07-31T09:00:00.000Z'),
        updatedAt: new Date('2025-07-31T09:00:00.000Z')
    };

    beforeEach(async () => {
        const mockPrismaServiceMethods = {
            view: {
                create: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                count: jest.fn(),
                aggregate: jest.fn(),
                groupBy: jest.fn()
            },
            video: {
                findUnique: jest.fn(),
                update: jest.fn()
            }
        };

        const mockCounterServiceMethods = {
            updateViewCount: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ViewService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaServiceMethods
                },
                {
                    provide: CounterService,
                    useValue: mockCounterServiceMethods
                }
            ]
        }).compile();

        service = module.get<ViewService>(ViewService);
        mockPrismaService = module.get(PrismaService);
        mockCounterService = module.get(CounterService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createViewDto: CreateViewDto = {
            userId: '123e4567-e89b-12d3-a456-426614174001',
            videoId: '123e4567-e89b-12d3-a456-426614174002',
            timespent: 120
        };

        it('should create a new view when no existing view found', async () => {
            (mockPrismaService.view.findFirst as jest.Mock).mockResolvedValue(
                null
            );
            (mockPrismaService.view.create as jest.Mock).mockResolvedValue(
                mockView
            );
            (mockPrismaService.video.update as jest.Mock).mockResolvedValue(
                mockVideo
            );
            (mockPrismaService.video.findUnique as jest.Mock).mockResolvedValue(
                { projectId: mockVideo.projectId }
            );
            (mockCounterService.updateViewCount as jest.Mock).mockResolvedValue(
                undefined
            );

            const result = await service.create(createViewDto);

            expect(mockPrismaService.view.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: createViewDto.userId,
                    videoId: createViewDto.videoId
                }
            });
            expect(mockPrismaService.view.create).toHaveBeenCalledWith({
                data: {
                    userId: createViewDto.userId,
                    videoId: createViewDto.videoId,
                    timespent: createViewDto.timespent
                }
            });
            expect(mockPrismaService.video.update).toHaveBeenCalledWith({
                where: { id: createViewDto.videoId },
                data: {
                    nbViews: {
                        increment: 1
                    }
                }
            });
            expect(mockCounterService.updateViewCount).toHaveBeenCalledWith(
                'project',
                mockVideo.projectId,
                true
            );
            expect(result).toEqual(mockView);
        });

        it('should update existing view when found', async () => {
            const existingView = { ...mockView, timespent: 60 };
            const updatedView = { ...mockView, timespent: 180 };

            (mockPrismaService.view.findFirst as jest.Mock).mockResolvedValue(
                existingView
            );
            (mockPrismaService.view.update as jest.Mock).mockResolvedValue(
                updatedView
            );

            const result = await service.create(createViewDto);

            expect(mockPrismaService.view.update).toHaveBeenCalledWith({
                where: { id: existingView.id },
                data: {
                    timespent: existingView.timespent + createViewDto.timespent
                }
            });
            expect(result).toEqual(updatedView);
        });
    });

    describe('findAll', () => {
        it('should return all views with user and video details', async () => {
            const mockViewsWithRelations = [
                {
                    ...mockView,
                    user: {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@example.com'
                    },
                    video: {
                        id: '123e4567-e89b-12d3-a456-426614174002',
                        title: 'Test Video',
                        videoUrl: 'https://example.com/video.mp4',
                        description: 'Test video description',
                        nbViews: 5
                    }
                }
            ];

            (mockPrismaService.view.findMany as jest.Mock).mockResolvedValue(
                mockViewsWithRelations
            );

            const result = await service.findAll();

            expect(mockPrismaService.view.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    video: {
                        select: {
                            id: true,
                            title: true,
                            videoUrl: true,
                            description: true,
                            nbViews: true
                        }
                    }
                }
            });
            expect(result).toEqual(mockViewsWithRelations);
        });
    });

    describe('findByUser', () => {
        it('should return views for a specific user', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const mockUserViews = [mockView];

            (mockPrismaService.view.findMany as jest.Mock).mockResolvedValue(
                mockUserViews
            );

            const result = await service.findByUser(userId);

            expect(mockPrismaService.view.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    video: {
                        select: {
                            id: true,
                            title: true,
                            videoUrl: true,
                            description: true,
                            nbViews: true
                        }
                    }
                }
            });
            expect(result).toEqual(mockUserViews);
        });
    });

    describe('findByVideo', () => {
        it('should return views for a specific video', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const mockVideoViews = [mockView];

            (mockPrismaService.view.findMany as jest.Mock).mockResolvedValue(
                mockVideoViews
            );

            const result = await service.findByVideo(videoId);

            expect(mockPrismaService.view.findMany).toHaveBeenCalledWith({
                where: { videoId },
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });
            expect(result).toEqual(mockVideoViews);
        });
    });

    describe('countVideoViews', () => {
        it('should return view count for a video', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const count = 10;

            (mockPrismaService.view.count as jest.Mock).mockResolvedValue(
                count
            );

            const result = await service.countVideoViews(videoId);

            expect(mockPrismaService.view.count).toHaveBeenCalledWith({
                where: { videoId }
            });
            expect(result).toEqual({ count });
        });
    });

    describe('getTotalTimeSpent', () => {
        it('should return total time spent viewing a video', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const totalTime = 1800;

            (mockPrismaService.view.aggregate as jest.Mock).mockResolvedValue({
                _sum: { timespent: totalTime }
            });

            const result = await service.getTotalTimeSpent(videoId);

            expect(mockPrismaService.view.aggregate).toHaveBeenCalledWith({
                where: { videoId },
                _sum: {
                    timespent: true
                }
            });
            expect(result).toEqual({ totalTime });
        });

        it('should return 0 when no views found', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';

            (mockPrismaService.view.aggregate as jest.Mock).mockResolvedValue({
                _sum: { timespent: null }
            });

            const result = await service.getTotalTimeSpent(videoId);

            expect(result).toEqual({ totalTime: 0 });
        });
    });

    describe('hasUserViewed', () => {
        it('should return true when user has viewed video', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const videoId = '123e4567-e89b-12d3-a456-426614174002';

            (mockPrismaService.view.findFirst as jest.Mock).mockResolvedValue(
                mockView
            );

            const result = await service.hasUserViewed(userId, videoId);

            expect(mockPrismaService.view.findFirst).toHaveBeenCalledWith({
                where: {
                    userId,
                    videoId
                }
            });
            expect(result).toEqual({ hasViewed: true });
        });

        it('should return false when user has not viewed video', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const videoId = '123e4567-e89b-12d3-a456-426614174002';

            (mockPrismaService.view.findFirst as jest.Mock).mockResolvedValue(
                null
            );

            const result = await service.hasUserViewed(userId, videoId);

            expect(result).toEqual({ hasViewed: false });
        });
    });

    describe('update', () => {
        it('should update a view', async () => {
            const viewId = '123e4567-e89b-12d3-a456-426614174000';
            const updateViewDto: UpdateViewDto = { timespent: 200 };
            const updatedView = { ...mockView, timespent: 200 };

            (mockPrismaService.view.update as jest.Mock).mockResolvedValue(
                updatedView
            );

            const result = await service.update(viewId, updateViewDto);

            expect(mockPrismaService.view.update).toHaveBeenCalledWith({
                where: { id: viewId },
                data: {
                    timespent: updateViewDto.timespent
                }
            });
            expect(result).toEqual(updatedView);
        });
    });

    describe('remove', () => {
        it('should remove a view and decrement counters', async () => {
            const viewId = '123e4567-e89b-12d3-a456-426614174000';

            (
                mockPrismaService.view.findUnique as jest.Mock
            ).mockResolvedValueOnce(mockView);
            (mockPrismaService.video.update as jest.Mock).mockResolvedValue(
                mockVideo
            );
            (mockPrismaService.video.findUnique as jest.Mock).mockResolvedValue(
                { projectId: mockVideo.projectId }
            );
            (mockPrismaService.view.delete as jest.Mock).mockResolvedValue(
                mockView
            );
            (mockCounterService.updateViewCount as jest.Mock).mockResolvedValue(
                undefined
            );

            const result = await service.remove(viewId);

            expect(mockPrismaService.video.update).toHaveBeenCalledWith({
                where: { id: mockView.videoId },
                data: {
                    nbViews: {
                        decrement: 1
                    }
                }
            });
            expect(mockCounterService.updateViewCount).toHaveBeenCalledWith(
                'project',
                mockVideo.projectId,
                false
            );
            expect(mockPrismaService.view.delete).toHaveBeenCalledWith({
                where: { id: viewId }
            });
            expect(result).toEqual(mockView);
        });
    });

    describe('getUserViewingStats', () => {
        it('should return user viewing statistics', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const mockStats = {
                _count: { id: 5 },
                _sum: { timespent: 600 }
            };
            const mockUniqueVideos = [
                { videoId: 'video1' },
                { videoId: 'video2' },
                { videoId: 'video3' }
            ];

            (mockPrismaService.view.aggregate as jest.Mock).mockResolvedValue(
                mockStats
            );
            (mockPrismaService.view.groupBy as jest.Mock).mockResolvedValue(
                mockUniqueVideos
            );

            const result = await service.getUserViewingStats(userId);

            expect(mockPrismaService.view.aggregate).toHaveBeenCalledWith({
                where: { userId },
                _count: {
                    id: true
                },
                _sum: {
                    timespent: true
                }
            });
            expect(mockPrismaService.view.groupBy).toHaveBeenCalledWith({
                by: ['videoId'],
                where: { userId }
            });
            expect(result).toEqual({
                totalViews: 5,
                totalTimeSpent: 600,
                uniqueVideos: 3
            });
        });

        it('should handle null stats', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const mockStats = {
                _count: { id: null },
                _sum: { timespent: null }
            };

            (mockPrismaService.view.aggregate as jest.Mock).mockResolvedValue(
                mockStats
            );
            (mockPrismaService.view.groupBy as jest.Mock).mockResolvedValue([]);

            const result = await service.getUserViewingStats(userId);

            expect(result).toEqual({
                totalViews: 0,
                totalTimeSpent: 0,
                uniqueVideos: 0
            });
        });
    });

    describe('inherited methods from BaseCrudService', () => {
        describe('findOne', () => {
            it('should return a view when found', async () => {
                const viewId = '123e4567-e89b-12d3-a456-426614174000';
                (
                    mockPrismaService.view.findUnique as jest.Mock
                ).mockResolvedValue(mockView);

                const result = await service.findOne(viewId);

                expect(mockPrismaService.view.findUnique).toHaveBeenCalledWith({
                    where: { id: viewId }
                });
                expect(result).toEqual(mockView);
            });

            it('should throw NotFoundException when view not found', async () => {
                const viewId = '123e4567-e89b-12d3-a456-426614174000';
                (
                    mockPrismaService.view.findUnique as jest.Mock
                ).mockResolvedValue(null);

                await expect(service.findOne(viewId)).rejects.toThrow(
                    NotFoundException
                );
            });
        });

        describe('findOneOrFail', () => {
            it('should return a view when found', async () => {
                const viewId = '123e4567-e89b-12d3-a456-426614174000';
                (
                    mockPrismaService.view.findUnique as jest.Mock
                ).mockResolvedValue(mockView);

                const result = await service.findOneOrFail(viewId);

                expect(result).toEqual(mockView);
            });

            it('should throw NotFoundException when view not found', async () => {
                const viewId = '123e4567-e89b-12d3-a456-426614174000';
                (
                    mockPrismaService.view.findUnique as jest.Mock
                ).mockResolvedValue(null);

                await expect(service.findOneOrFail(viewId)).rejects.toThrow(
                    NotFoundException
                );
            });
        });
    });
});
