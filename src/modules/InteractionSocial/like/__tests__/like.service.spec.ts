import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Like } from '@prisma/client';
import { LikeService } from '../like.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CounterService } from '../../../../core/common/services/counter.service';
import { CreateLikeDto } from '../dto/create-like.dto';

describe('LikeService', () => {
    let service: LikeService;
    let mockPrismaService: any;
    let mockCounterService: jest.Mocked<CounterService>;

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
        const mockPrisma = {
            like: {
                create: jest.fn().mockResolvedValue(mockLike),
                findMany: jest.fn().mockResolvedValue([mockLike]),
                findUnique: jest.fn().mockResolvedValue(mockLike),
                findFirst: jest.fn().mockResolvedValue(null),
                update: jest.fn().mockResolvedValue(mockLike),
                delete: jest.fn().mockResolvedValue(mockLike),
                count: jest.fn().mockResolvedValue(1)
            }
        };

        const mockCounterServiceMethods = {
            updateCommentCount: jest.fn().mockResolvedValue(undefined),
            updateLikeCount: jest.fn().mockResolvedValue(undefined),
            updateViewCount: jest.fn().mockResolvedValue(undefined),
            recalculateCounters: jest.fn().mockResolvedValue(undefined)
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LikeService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma
                },
                {
                    provide: CounterService,
                    useValue: mockCounterServiceMethods
                }
            ]
        }).compile();

        service = module.get<LikeService>(LikeService);
        mockPrismaService = module.get(PrismaService);
        mockCounterService = module.get(CounterService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a like for a project and update counter', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            const result = await service.create(createLikeDto);

            expect(result).toEqual(mockLike);
            expect(mockPrismaService.like.create).toHaveBeenCalledWith({
                data: createLikeDto
            });
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                true
            );
        });

        it('should create a like for a post and update counter', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                postId: 'post-1'
            };

            const postLike = { ...mockLike, postId: 'post-1', projectId: null };
            mockPrismaService.like.create.mockResolvedValue(postLike);

            const result = await service.create(createLikeDto);

            expect(result).toEqual(postLike);
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'post',
                'post-1',
                true
            );
        });

        it('should create a like for a comment and update counter', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                commentId: 'comment-1'
            };

            const commentLike = {
                ...mockLike,
                commentId: 'comment-1',
                projectId: null
            };
            mockPrismaService.like.create.mockResolvedValue(commentLike);

            const result = await service.create(createLikeDto);

            expect(result).toEqual(commentLike);
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'comment',
                'comment-1',
                true
            );
        });

        it('should throw ConflictException if user already liked the item', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            // Mock existing like
            mockPrismaService.like.findFirst.mockResolvedValue(mockLike);

            await expect(service.create(createLikeDto)).rejects.toThrow(
                ConflictException
            );
            expect(mockPrismaService.like.create).not.toHaveBeenCalled();
            expect(mockCounterService.updateLikeCount).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove a like and update project counter', async () => {
            mockPrismaService.like.findUnique.mockResolvedValue(mockLike);
            mockPrismaService.like.delete.mockResolvedValue(mockLike);

            const result = await service.remove('like-1');

            expect(result).toEqual(mockLike);
            expect(mockPrismaService.like.delete).toHaveBeenCalledWith({
                where: { id: 'like-1' }
            });
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                false
            );
        });

        it('should remove a like and update post counter', async () => {
            const postLike = { ...mockLike, postId: 'post-1', projectId: null };
            mockPrismaService.like.findUnique.mockResolvedValue(postLike);
            mockPrismaService.like.delete.mockResolvedValue(postLike);

            const result = await service.remove('like-1');

            expect(result).toEqual(postLike);
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'post',
                'post-1',
                false
            );
        });

        it('should remove a like and update comment counter', async () => {
            const commentLike = {
                ...mockLike,
                commentId: 'comment-1',
                projectId: null
            };
            mockPrismaService.like.findUnique.mockResolvedValue(commentLike);
            mockPrismaService.like.delete.mockResolvedValue(commentLike);

            const result = await service.remove('like-1');

            expect(result).toEqual(commentLike);
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'comment',
                'comment-1',
                false
            );
        });
    });

    describe('toggleLike', () => {
        it('should create a like when none exists', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            // No existing like
            mockPrismaService.like.findFirst.mockResolvedValue(null);

            const result = await service.toggleLike(createLikeDto);

            expect(result).toEqual({ liked: true, like: mockLike });
            expect(mockPrismaService.like.create).toHaveBeenCalled();
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                true
            );
        });

        it('should remove a like when one exists', async () => {
            const createLikeDto: CreateLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            // Existing like found
            mockPrismaService.like.findFirst.mockResolvedValue(mockLike);
            mockPrismaService.like.findUnique.mockResolvedValue(mockLike);
            mockPrismaService.like.delete.mockResolvedValue(mockLike);

            const result = await service.toggleLike(createLikeDto);

            expect(result).toEqual({ liked: false });
            expect(mockPrismaService.like.delete).toHaveBeenCalled();
            expect(mockCounterService.updateLikeCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                false
            );
        });
    });

    describe('findByProject', () => {
        it('should find all likes for a project with user info', async () => {
            mockPrismaService.like.findMany.mockResolvedValue([
                mockLikeWithUser
            ]);

            const result = await service.findByProject('project-1');

            expect(result).toEqual([mockLikeWithUser]);
            expect(mockPrismaService.like.findMany).toHaveBeenCalledWith({
                where: { projectId: 'project-1' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findByPost', () => {
        it('should find all likes for a post with user info', async () => {
            mockPrismaService.like.findMany.mockResolvedValue([
                mockLikeWithUser
            ]);

            const result = await service.findByPost('post-1');

            expect(result).toEqual([mockLikeWithUser]);
            expect(mockPrismaService.like.findMany).toHaveBeenCalledWith({
                where: { postId: 'post-1' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findByComment', () => {
        it('should find all likes for a comment with user info', async () => {
            mockPrismaService.like.findMany.mockResolvedValue([
                mockLikeWithUser
            ]);

            const result = await service.findByComment('comment-1');

            expect(result).toEqual([mockLikeWithUser]);
            expect(mockPrismaService.like.findMany).toHaveBeenCalledWith({
                where: { commentId: 'comment-1' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('countProjectLikes', () => {
        it('should count likes for a project', async () => {
            mockPrismaService.like.count.mockResolvedValue(5);

            const result = await service.countProjectLikes('project-1');

            expect(result).toBe(5);
            expect(mockPrismaService.like.count).toHaveBeenCalledWith({
                where: { projectId: 'project-1' }
            });
        });
    });

    describe('countPostLikes', () => {
        it('should count likes for a post', async () => {
            mockPrismaService.like.count.mockResolvedValue(10);

            const result = await service.countPostLikes('post-1');

            expect(result).toBe(10);
            expect(mockPrismaService.like.count).toHaveBeenCalledWith({
                where: { postId: 'post-1' }
            });
        });
    });

    describe('countCommentLikes', () => {
        it('should count likes for a comment', async () => {
            mockPrismaService.like.count.mockResolvedValue(3);

            const result = await service.countCommentLikes('comment-1');

            expect(result).toBe(3);
            expect(mockPrismaService.like.count).toHaveBeenCalledWith({
                where: { commentId: 'comment-1' }
            });
        });
    });

    describe('hasUserLiked', () => {
        it('should return true when user has liked a project', async () => {
            mockPrismaService.like.findFirst.mockResolvedValue(mockLike);

            const result = await service.hasUserLiked(
                'user-1',
                'project-1',
                'project'
            );

            expect(result).toBe(true);
            expect(mockPrismaService.like.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    projectId: 'project-1'
                }
            });
        });

        it('should return false when user has not liked a post', async () => {
            mockPrismaService.like.findFirst.mockResolvedValue(null);

            const result = await service.hasUserLiked(
                'user-1',
                'post-1',
                'post'
            );

            expect(result).toBe(false);
            expect(mockPrismaService.like.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    postId: 'post-1'
                }
            });
        });

        it('should return true when user has liked a comment', async () => {
            mockPrismaService.like.findFirst.mockResolvedValue(mockLike);

            const result = await service.hasUserLiked(
                'user-1',
                'comment-1',
                'comment'
            );

            expect(result).toBe(true);
            expect(mockPrismaService.like.findFirst).toHaveBeenCalledWith({
                where: {
                    userId: 'user-1',
                    commentId: 'comment-1'
                }
            });
        });
    });

    describe('getUserLikeActivity', () => {
        it('should return user like activity statistics', async () => {
            mockPrismaService.like.count
                .mockResolvedValueOnce(5) // project likes
                .mockResolvedValueOnce(10) // post likes
                .mockResolvedValueOnce(3); // comment likes

            const result = await service.getUserLikeActivity('user-1');

            expect(result).toEqual({
                totalLikes: 18,
                projectLikes: 5,
                postLikes: 10,
                commentLikes: 3
            });

            expect(mockPrismaService.like.count).toHaveBeenCalledTimes(3);
            expect(mockPrismaService.like.count).toHaveBeenNthCalledWith(1, {
                where: { userId: 'user-1', projectId: { not: null } }
            });
            expect(mockPrismaService.like.count).toHaveBeenNthCalledWith(2, {
                where: { userId: 'user-1', postId: { not: null } }
            });
            expect(mockPrismaService.like.count).toHaveBeenNthCalledWith(3, {
                where: { userId: 'user-1', commentId: { not: null } }
            });
        });
    });
});
