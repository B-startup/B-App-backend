import { Test, TestingModule } from '@nestjs/testing';
import { Comment } from '@prisma/client';
import { CommentService } from '../comment.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CounterService } from '../../../../core/common/services/counter.service';
import { CreateCommentDto } from '../dto/create-comment.dto';

describe('CommentService', () => {
    let service: CommentService;
    let mockPrismaService: any;
    let mockCounterService: jest.Mocked<CounterService>;

    const mockComment: Comment = {
        id: 'comment-1',
        content: 'This is a test comment',
        userId: 'user-1',
        projectId: 'project-1',
        postId: null,
        parentId: null,
        nbLikes: 0,
        createdAt: new Date('2025-07-31T10:00:00.000Z'),
        updatedAt: new Date('2025-07-31T10:00:00.000Z')
    };

    const mockCommentWithReplies = {
        ...mockComment,
        user: {
            id: 'user-1',
            name: 'John Doe',
            profilePicture: 'profile.jpg'
        },
        replies: [
            {
                id: 'reply-1',
                content: 'This is a reply',
                userId: 'user-2',
                parentId: 'comment-1',
                user: {
                    id: 'user-2',
                    name: 'Jane Doe',
                    profilePicture: 'profile2.jpg'
                }
            }
        ]
    };

    beforeEach(async () => {
        const mockPrisma = {
            comment: {
                create: jest.fn().mockResolvedValue(mockComment),
                findMany: jest.fn().mockResolvedValue([mockComment]),
                findUnique: jest.fn().mockResolvedValue(mockComment),
                findFirst: jest.fn().mockResolvedValue(mockComment),
                update: jest.fn().mockResolvedValue(mockComment),
                delete: jest.fn().mockResolvedValue(mockComment),
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
                CommentService,
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

        service = module.get<CommentService>(CommentService);
        mockPrismaService = module.get(PrismaService);
        mockCounterService = module.get(CounterService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a comment for a project and update counter', async () => {
            const createCommentDto: CreateCommentDto = {
                content: 'Test comment',
                userId: 'user-1',
                projectId: 'project-1'
            };

            const result = await service.create(createCommentDto);

            expect(result).toEqual(mockComment);
            expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
                data: createCommentDto
            });
            expect(mockCounterService.updateCommentCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                true
            );
        });

        it('should create a comment for a post and update counter', async () => {
            const createCommentDto: CreateCommentDto = {
                content: 'Test comment on post',
                userId: 'user-1',
                postId: 'post-1'
            };

            const postComment = { ...mockComment, postId: 'post-1', projectId: null };
            mockPrismaService.comment.create.mockResolvedValue(postComment);

            const result = await service.create(createCommentDto);

            expect(result).toEqual(postComment);
            expect(mockCounterService.updateCommentCount).toHaveBeenCalledWith(
                'post',
                'post-1',
                true
            );
        });

        it('should create a reply comment', async () => {
            const createReplyDto: CreateCommentDto = {
                content: 'This is a reply',
                userId: 'user-2',
                parentId: 'comment-1',
                projectId: 'project-1'
            };

            const reply = { ...mockComment, id: 'reply-1', parentId: 'comment-1' };
            mockPrismaService.comment.create.mockResolvedValue(reply);

            const result = await service.create(createReplyDto);

            expect(result).toEqual(reply);
            expect(mockCounterService.updateCommentCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                true
            );
        });
    });

    describe('remove', () => {
        it('should remove a comment and update project counter', async () => {
            mockPrismaService.comment.findUnique.mockResolvedValue(mockComment);
            mockPrismaService.comment.delete.mockResolvedValue(mockComment);

            const result = await service.remove('comment-1');

            expect(result).toEqual(mockComment);
            expect(mockPrismaService.comment.delete).toHaveBeenCalledWith({
                where: { id: 'comment-1' }
            });
            expect(mockCounterService.updateCommentCount).toHaveBeenCalledWith(
                'project',
                'project-1',
                false
            );
        });

        it('should remove a comment and update post counter', async () => {
            const postComment = { ...mockComment, postId: 'post-1', projectId: null };
            mockPrismaService.comment.findUnique.mockResolvedValue(postComment);
            mockPrismaService.comment.delete.mockResolvedValue(postComment);

            const result = await service.remove('comment-1');

            expect(result).toEqual(postComment);
            expect(mockCounterService.updateCommentCount).toHaveBeenCalledWith(
                'post',
                'post-1',
                false
            );
        });
    });

    describe('findByProject', () => {
        it('should find all comments for a project with user info and replies', async () => {
            mockPrismaService.comment.findMany.mockResolvedValue([mockCommentWithReplies]);

            const result = await service.findByProject('project-1');

            expect(result).toEqual([mockCommentWithReplies]);
            expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
                where: { projectId: 'project-1' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    profilePicture: true
                                }
                            }
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findByPost', () => {
        it('should find all comments for a post with user info and replies', async () => {
            mockPrismaService.comment.findMany.mockResolvedValue([mockCommentWithReplies]);

            const result = await service.findByPost('post-1');

            expect(result).toEqual([mockCommentWithReplies]);
            expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
                where: { postId: 'post-1' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    },
                    replies: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    profilePicture: true
                                }
                            }
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findReplies', () => {
        it('should find all replies for a comment', async () => {
            const replies = [mockCommentWithReplies.replies[0]];
            mockPrismaService.comment.findMany.mockResolvedValue(replies);

            const result = await service.findReplies('comment-1');

            expect(result).toEqual(replies);
            expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
                where: { parentId: 'comment-1' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
        });
    });

    describe('getProjectCommentStats', () => {
        it('should return comment statistics for a project', async () => {
            mockPrismaService.comment.count
                .mockResolvedValueOnce(10) // total comments
                .mockResolvedValueOnce(7); // top level comments

            const result = await service.getProjectCommentStats('project-1');

            expect(result).toEqual({
                totalComments: 10,
                topLevelComments: 7,
                replies: 3
            });

            expect(mockPrismaService.comment.count).toHaveBeenCalledTimes(2);
            expect(mockPrismaService.comment.count).toHaveBeenNthCalledWith(1, {
                where: { projectId: 'project-1' }
            });
            expect(mockPrismaService.comment.count).toHaveBeenNthCalledWith(2, {
                where: { 
                    projectId: 'project-1',
                    parentId: null 
                }
            });
        });
    });

    describe('getPostCommentStats', () => {
        it('should return comment statistics for a post', async () => {
            mockPrismaService.comment.count
                .mockResolvedValueOnce(15) // total comments
                .mockResolvedValueOnce(12); // top level comments

            const result = await service.getPostCommentStats('post-1');

            expect(result).toEqual({
                totalComments: 15,
                topLevelComments: 12,
                replies: 3
            });

            expect(mockPrismaService.comment.count).toHaveBeenCalledTimes(2);
            expect(mockPrismaService.comment.count).toHaveBeenNthCalledWith(1, {
                where: { postId: 'post-1' }
            });
            expect(mockPrismaService.comment.count).toHaveBeenNthCalledWith(2, {
                where: { 
                    postId: 'post-1',
                    parentId: null 
                }
            });
        });
    });

    describe('incrementLikes (deprecated)', () => {
        it('should increment the like count for a comment', async () => {
            const updatedComment = { ...mockComment, nbLikes: 1 };
            mockPrismaService.comment.update.mockResolvedValue(updatedComment);

            const result = await service.incrementLikes('comment-1');

            expect(result).toEqual(updatedComment);
            expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
                where: { id: 'comment-1' },
                data: {
                    nbLikes: {
                        increment: 1
                    }
                }
            });
        });
    });

    describe('decrementLikes (deprecated)', () => {
        it('should decrement the like count for a comment', async () => {
            const updatedComment = { ...mockComment, nbLikes: -1 };
            mockPrismaService.comment.update.mockResolvedValue(updatedComment);

            const result = await service.decrementLikes('comment-1');

            expect(result).toEqual(updatedComment);
            expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
                where: { id: 'comment-1' },
                data: {
                    nbLikes: {
                        decrement: 1
                    }
                }
            });
        });
    });
});
