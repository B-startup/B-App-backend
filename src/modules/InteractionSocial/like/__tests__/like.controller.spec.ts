import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { LikeController } from '../like.controller';
import { LikeService } from '../like.service';
import { CreateLikeDto } from '../dto/create-like.dto';
import { UpdateLikeDto } from '../dto/update-like.dto';
import { Like } from '@prisma/client';

describe('LikeController', () => {
    let controller: LikeController;
    let mockLikeService: jest.Mocked<LikeService>;

    const mockLike: Like = {
        id: 'like-1',
        userId: 'user-1',
        projectId: 'project-1',
        postId: null,
        commentId: null,
        createdAt: new Date('2025-07-31T10:00:00.000Z'),
        updatedAt: new Date('2025-07-31T10:00:00.000Z')
    };

    const mockLikeWithUser = {
        ...mockLike,
        user: {
            id: 'user-1',
            name: 'John Doe',
            profilePicture: 'profile.jpg'
        }
    };

    beforeEach(async () => {
        const mockService = {
            create: jest.fn(),
            toggleLike: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByProject: jest.fn(),
            findByPost: jest.fn(),
            findByComment: jest.fn(),
            findByUser: jest.fn(),
            countProjectLikes: jest.fn(),
            countPostLikes: jest.fn(),
            countCommentLikes: jest.fn(),
            hasUserLiked: jest.fn(),
            getUserLikeActivity: jest.fn(),
            paginate: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [LikeController],
            providers: [
                {
                    provide: LikeService,
                    useValue: mockService
                }
            ]
        }).compile();

        controller = module.get<LikeController>(LikeController);
        mockLikeService = module.get(LikeService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new like', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            mockLikeService.create.mockResolvedValue(mockLike);

            const result = await controller.create(createLikeDto);

            expect(result).toEqual(mockLike);
            expect(mockLikeService.create).toHaveBeenCalledWith(createLikeDto);
        });

        it('should handle ConflictException when like already exists', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            mockLikeService.create.mockRejectedValue(new ConflictException('User has already liked this item'));

            await expect(controller.create(createLikeDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('toggleLike', () => {
        it('should toggle like successfully (like)', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            const toggleResult = { liked: true, like: mockLike };
            mockLikeService.toggleLike.mockResolvedValue(toggleResult);

            const result = await controller.toggleLike(createLikeDto);

            expect(result).toEqual(toggleResult);
            expect(mockLikeService.toggleLike).toHaveBeenCalledWith(createLikeDto);
        });

        it('should toggle like successfully (unlike)', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            const toggleResult = { liked: false };
            mockLikeService.toggleLike.mockResolvedValue(toggleResult);

            const result = await controller.toggleLike(createLikeDto);

            expect(result).toEqual(toggleResult);
            expect(mockLikeService.toggleLike).toHaveBeenCalledWith(createLikeDto);
        });
    });

    describe('findAll', () => {
        it('should return all likes', async () => {
            const likes = [mockLike];
            mockLikeService.findAll.mockResolvedValue(likes);

            const result = await controller.findAll();

            expect(result).toEqual(likes);
            expect(mockLikeService.findAll).toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return likes by user', async () => {
            const likes = [mockLike];
            mockLikeService.findByUser.mockResolvedValue(likes);

            const result = await controller.findByUser('user-1');

            expect(result).toEqual(likes);
            expect(mockLikeService.findByUser).toHaveBeenCalledWith('user-1');
        });
    });

    describe('getUserLikeActivity', () => {
        it('should return user like activity', async () => {
            const activity = {
                totalLikes: 18,
                projectLikes: 5,
                postLikes: 10,
                commentLikes: 3
            };
            mockLikeService.getUserLikeActivity.mockResolvedValue(activity);

            const result = await controller.getUserLikeActivity('user-1');

            expect(result).toEqual(activity);
            expect(mockLikeService.getUserLikeActivity).toHaveBeenCalledWith('user-1');
        });
    });

    describe('findByProject', () => {
        it('should return likes for a project', async () => {
            const likes = [mockLikeWithUser];
            mockLikeService.findByProject.mockResolvedValue(likes);

            const result = await controller.findByProject('project-1');

            expect(result).toEqual(likes);
            expect(mockLikeService.findByProject).toHaveBeenCalledWith('project-1');
        });
    });

    describe('countProjectLikes', () => {
        it('should return project like count', async () => {
            mockLikeService.countProjectLikes.mockResolvedValue(5);

            const result = await controller.countProjectLikes('project-1');

            expect(result).toEqual({ count: 5 });
            expect(mockLikeService.countProjectLikes).toHaveBeenCalledWith('project-1');
        });
    });

    describe('findByPost', () => {
        it('should return likes for a post', async () => {
            const likes = [mockLikeWithUser];
            mockLikeService.findByPost.mockResolvedValue(likes);

            const result = await controller.findByPost('post-1');

            expect(result).toEqual(likes);
            expect(mockLikeService.findByPost).toHaveBeenCalledWith('post-1');
        });
    });

    describe('countPostLikes', () => {
        it('should return post like count', async () => {
            mockLikeService.countPostLikes.mockResolvedValue(10);

            const result = await controller.countPostLikes('post-1');

            expect(result).toEqual({ count: 10 });
            expect(mockLikeService.countPostLikes).toHaveBeenCalledWith('post-1');
        });
    });

    describe('findByComment', () => {
        it('should return likes for a comment', async () => {
            const likes = [mockLikeWithUser];
            mockLikeService.findByComment.mockResolvedValue(likes);

            const result = await controller.findByComment('comment-1');

            expect(result).toEqual(likes);
            expect(mockLikeService.findByComment).toHaveBeenCalledWith('comment-1');
        });
    });

    describe('countCommentLikes', () => {
        it('should return comment like count', async () => {
            mockLikeService.countCommentLikes.mockResolvedValue(3);

            const result = await controller.countCommentLikes('comment-1');

            expect(result).toEqual({ count: 3 });
            expect(mockLikeService.countCommentLikes).toHaveBeenCalledWith('comment-1');
        });
    });

    describe('hasUserLiked', () => {
        it('should return true when user has liked the target', async () => {
            mockLikeService.hasUserLiked.mockResolvedValue(true);

            const result = await controller.hasUserLiked('user-1', 'project-1', 'project');

            expect(result).toEqual({ hasLiked: true });
            expect(mockLikeService.hasUserLiked).toHaveBeenCalledWith('user-1', 'project-1', 'project');
        });

        it('should return false when user has not liked the target', async () => {
            mockLikeService.hasUserLiked.mockResolvedValue(false);

            const result = await controller.hasUserLiked('user-1', 'post-1', 'post');

            expect(result).toEqual({ hasLiked: false });
            expect(mockLikeService.hasUserLiked).toHaveBeenCalledWith('user-1', 'post-1', 'post');
        });
    });

    describe('paginate', () => {
        it('should return paginated likes', async () => {
            const paginatedResult = [mockLike];
            mockLikeService.paginate.mockResolvedValue(paginatedResult);

            const result = await controller.paginate('0', '10');

            expect(result).toEqual(paginatedResult);
            expect(mockLikeService.paginate).toHaveBeenCalledWith(0, 10);
        });

        it('should handle optional parameters', async () => {
            const paginatedResult = [mockLike];
            mockLikeService.paginate.mockResolvedValue(paginatedResult);

            const result = await controller.paginate();

            expect(result).toEqual(paginatedResult);
            expect(mockLikeService.paginate).toHaveBeenCalledWith(0, 10);
        });
    });

    describe('findOne', () => {
        it('should return a like by id', async () => {
            mockLikeService.findOne.mockResolvedValue(mockLike);

            const result = await controller.findOne('like-1');

            expect(result).toEqual(mockLike);
            expect(mockLikeService.findOne).toHaveBeenCalledWith('like-1');
        });
    });

    describe('update', () => {
        it('should update a like', async () => {
            const updateLikeDto: UpdateLikeDto = {
                // UpdateLikeDto is typically empty for likes, but included for completeness
            };
            const updatedLike = { ...mockLike };
            mockLikeService.update.mockResolvedValue(updatedLike);

            const result = await controller.update('like-1', updateLikeDto);

            expect(result).toEqual(updatedLike);
            expect(mockLikeService.update).toHaveBeenCalledWith('like-1', updateLikeDto);
        });
    });

    describe('remove', () => {
        it('should remove a like', async () => {
            mockLikeService.remove.mockResolvedValue(mockLike);

            const result = await controller.remove('like-1');

            expect(result).toEqual(mockLike);
            expect(mockLikeService.remove).toHaveBeenCalledWith('like-1');
        });
    });
});
