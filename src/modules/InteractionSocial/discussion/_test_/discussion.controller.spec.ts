import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionController } from '../discussion.controller';
import { DiscussionService } from '../discussion.service';
import { DiscussionType } from '@prisma/client';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';

describe('DiscussionController', () => {
    let controller: DiscussionController;
    let service: DiscussionService;

    const mockDiscussionService = {
        createDiscussion: jest.fn(),
        getUserDiscussions: jest.fn(),
        getDiscussionById: jest.fn(),
        deleteDiscussion: jest.fn(),
        getProjectDiscussions: jest.fn(),
        searchDiscussions: jest.fn(),
    };

    const mockUser1 = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: 'john.jpg'
    };

    const mockUser2 = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        profilePicture: 'jane.jpg'
    };

    const mockDiscussionResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        senderId: mockUser1.id,
        receiverId: mockUser2.id,
        type: DiscussionType.PRIVATE,
        projectId: null,
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
        updatedAt: new Date('2023-12-01T10:00:00.000Z'),
        sender: mockUser1,
        receiver: mockUser2,
        project: null,
        lastMessage: null,
        messageCount: 0
    };

    const mockTokenBlacklistGuard = {
        canActivate: jest.fn().mockReturnValue(true),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DiscussionController],
            providers: [
                {
                    provide: DiscussionService,
                    useValue: mockDiscussionService,
                },
            ],
        })
            .overrideGuard(TokenBlacklistGuard)
            .useValue(mockTokenBlacklistGuard)
            .compile();

        controller = module.get<DiscussionController>(DiscussionController);
        service = module.get<DiscussionService>(DiscussionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createDiscussion', () => {
        it('should create a discussion successfully', async () => {
            const createDiscussionDto = {
                receiverId: mockUser2.id,
                type: DiscussionType.PRIVATE
            };

            mockDiscussionService.createDiscussion.mockResolvedValue(mockDiscussionResponse);

            const result = await controller.createDiscussion(mockUser1.id, createDiscussionDto);

            expect(service.createDiscussion).toHaveBeenCalledWith(mockUser1.id, createDiscussionDto);
            expect(result).toEqual(mockDiscussionResponse);
        });
    });

    describe('getUserDiscussions', () => {
        it('should return user discussions successfully', async () => {
            const discussions = [mockDiscussionResponse];
            mockDiscussionService.getUserDiscussions.mockResolvedValue(discussions);

            const result = await controller.getUserDiscussions(mockUser1.id);

            expect(service.getUserDiscussions).toHaveBeenCalledWith(mockUser1.id);
            expect(result).toEqual(discussions);
        });
    });

    describe('getDiscussionById', () => {
        it('should return discussion by ID successfully', async () => {
            mockDiscussionService.getDiscussionById.mockResolvedValue(mockDiscussionResponse);

            const result = await controller.getDiscussionById(mockDiscussionResponse.id, mockUser1.id);

            expect(service.getDiscussionById).toHaveBeenCalledWith(mockDiscussionResponse.id, mockUser1.id);
            expect(result).toEqual(mockDiscussionResponse);
        });
    });

    describe('deleteDiscussion', () => {
        it('should delete discussion successfully', async () => {
            mockDiscussionService.deleteDiscussion.mockResolvedValue(undefined);

            await controller.deleteDiscussion(mockDiscussionResponse.id, mockUser1.id);

            expect(service.deleteDiscussion).toHaveBeenCalledWith(mockDiscussionResponse.id, mockUser1.id);
        });
    });

    describe('getProjectDiscussions', () => {
        it('should return project discussions successfully', async () => {
            const projectId = '123e4567-e89b-12d3-a456-426614174003';
            const discussions = [mockDiscussionResponse];
            mockDiscussionService.getProjectDiscussions.mockResolvedValue(discussions);

            const result = await controller.getProjectDiscussions(projectId);

            expect(service.getProjectDiscussions).toHaveBeenCalledWith(projectId);
            expect(result).toEqual(discussions);
        });
    });

    describe('searchDiscussions', () => {
        it('should search discussions successfully', async () => {
            const query = 'John';
            const discussions = [mockDiscussionResponse];
            mockDiscussionService.searchDiscussions.mockResolvedValue(discussions);

            const result = await controller.searchDiscussions(mockUser1.id, query);

            expect(service.searchDiscussions).toHaveBeenCalledWith(mockUser1.id, query);
            expect(result).toEqual(discussions);
        });
    });
});
