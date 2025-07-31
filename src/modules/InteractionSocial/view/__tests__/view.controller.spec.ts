import { Test, TestingModule } from '@nestjs/testing';
import { ViewController } from '../view.controller';
import { ViewService } from '../view.service';
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';

describe('ViewController', () => {
    let controller: ViewController;
    let mockViewService: jest.Mocked<ViewService>;

    const mockView = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        videoId: '123e4567-e89b-12d3-a456-426614174002',
        timespent: 120,
        createdAt: new Date('2025-07-31T10:00:00.000Z'),
        updatedAt: new Date('2025-07-31T10:00:00.000Z')
    };

    beforeEach(async () => {
        const mockViewServiceMethods = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByUser: jest.fn(),
            findByVideo: jest.fn(),
            countVideoViews: jest.fn(),
            getTotalTimeSpent: jest.fn(),
            hasUserViewed: jest.fn(),
            getUserViewingStats: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ViewController],
            providers: [
                {
                    provide: ViewService,
                    useValue: mockViewServiceMethods
                }
            ]
        }).compile();

        controller = module.get<ViewController>(ViewController);
        mockViewService = module.get(ViewService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new view', async () => {
            const createViewDto: CreateViewDto = {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 120
            };

            mockViewService.create.mockResolvedValue(mockView);

            const result = await controller.create(createViewDto);

            expect(mockViewService.create).toHaveBeenCalledWith(createViewDto);
            expect(result).toEqual(mockView);
        });
    });

    describe('findAll', () => {
        it('should return all views', async () => {
            const mockViews = [mockView];
            mockViewService.findAll.mockResolvedValue(mockViews);

            const result = await controller.findAll();

            expect(mockViewService.findAll).toHaveBeenCalled();
            expect(result).toEqual(mockViews);
        });
    });

    describe('findByUser', () => {
        it('should return views for a specific user', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const mockUserViews = [mockView];

            mockViewService.findByUser.mockResolvedValue(mockUserViews);

            const result = await controller.findByUser(userId);

            expect(mockViewService.findByUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockUserViews);
        });
    });

    describe('findByVideo', () => {
        it('should return views for a specific video', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const mockVideoViews = [mockView];

            mockViewService.findByVideo.mockResolvedValue(mockVideoViews);

            const result = await controller.findByVideo(videoId);

            expect(mockViewService.findByVideo).toHaveBeenCalledWith(videoId);
            expect(result).toEqual(mockVideoViews);
        });
    });

    describe('countVideoViews', () => {
        it('should return view count for a video', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const countResult = { count: 10 };

            mockViewService.countVideoViews.mockResolvedValue(countResult);

            const result = await controller.countVideoViews(videoId);

            expect(mockViewService.countVideoViews).toHaveBeenCalledWith(videoId);
            expect(result).toEqual(countResult);
        });
    });

    describe('getTotalTimeSpent', () => {
        it('should return total time spent viewing a video', async () => {
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const timeResult = { totalTime: 1800 };

            mockViewService.getTotalTimeSpent.mockResolvedValue(timeResult);

            const result = await controller.getTotalTimeSpent(videoId);

            expect(mockViewService.getTotalTimeSpent).toHaveBeenCalledWith(videoId);
            expect(result).toEqual(timeResult);
        });
    });

    describe('hasUserViewed', () => {
        it('should check if user has viewed a video', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const videoId = '123e4567-e89b-12d3-a456-426614174002';
            const hasViewedResult = { hasViewed: true };

            mockViewService.hasUserViewed.mockResolvedValue(hasViewedResult);

            const result = await controller.hasUserViewed(userId, videoId);

            expect(mockViewService.hasUserViewed).toHaveBeenCalledWith(userId, videoId);
            expect(result).toEqual(hasViewedResult);
        });
    });

    describe('getUserViewingStats', () => {
        it('should return user viewing statistics', async () => {
            const userId = '123e4567-e89b-12d3-a456-426614174001';
            const statsResult = {
                totalViews: 5,
                totalTimeSpent: 600,
                uniqueVideos: 3
            };

            mockViewService.getUserViewingStats.mockResolvedValue(statsResult);

            const result = await controller.getUserViewingStats(userId);

            expect(mockViewService.getUserViewingStats).toHaveBeenCalledWith(userId);
            expect(result).toEqual(statsResult);
        });
    });

    describe('findOne', () => {
        it('should return a specific view', async () => {
            const viewId = '123e4567-e89b-12d3-a456-426614174000';

            mockViewService.findOne.mockResolvedValue(mockView);

            const result = await controller.findOne(viewId);

            expect(mockViewService.findOne).toHaveBeenCalledWith(viewId);
            expect(result).toEqual(mockView);
        });
    });

    describe('update', () => {
        it('should update a view', async () => {
            const viewId = '123e4567-e89b-12d3-a456-426614174000';
            const updateViewDto: UpdateViewDto = { timespent: 200 };
            const updatedView = { ...mockView, timespent: 200 };

            mockViewService.update.mockResolvedValue(updatedView);

            const result = await controller.update(viewId, updateViewDto);

            expect(mockViewService.update).toHaveBeenCalledWith(viewId, updateViewDto);
            expect(result).toEqual(updatedView);
        });
    });

    describe('remove', () => {
        it('should remove a view', async () => {
            const viewId = '123e4567-e89b-12d3-a456-426614174000';

            mockViewService.remove.mockResolvedValue(mockView);

            const result = await controller.remove(viewId);

            expect(mockViewService.remove).toHaveBeenCalledWith(viewId);
            expect(result).toEqual(mockView);
        });
    });
});
