import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../comment.controller';
import { CommentService } from '../comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { Comment } from '@prisma/client';

describe('CommentController', () => {
    let controller: CommentController;
    let mockCommentService: jest.Mocked<CommentService>;

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

    const mockCommentWithUser = {
        ...mockComment,
        user: {
            id: 'user-1',
            name: 'John Doe',
            profilePicture: 'profile.jpg'
        },
        replies: []
    };

    beforeEach(async () => {
        const mockService = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            findByProject: jest.fn(),
            findByPost: jest.fn(),
            findByUser: jest.fn(),
            findReplies: jest.fn(),
            getProjectCommentStats: jest.fn(),
            getPostCommentStats: jest.fn(),
            incrementLikes: jest.fn(),
            decrementLikes: jest.fn(),
            search: jest.fn(),
            paginate: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentController],
            providers: [
                {
                    provide: CommentService,
                    useValue: mockService
                }
            ]
        }).compile();

        controller = module.get<CommentController>(CommentController);
        mockCommentService = module.get(CommentService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new comment', async () => {
            const createCommentDto: CreateCommentDto = {
                content: 'Test comment',
                userId: 'user-1',
                projectId: 'project-1'
            };

            mockCommentService.create.mockResolvedValue(mockComment);

            const result = await controller.create(createCommentDto);

            expect(result).toEqual(mockComment);
            expect(mockCommentService.create).toHaveBeenCalledWith(createCommentDto);
        });

        it('should create a reply comment', async () => {
            const createReplyDto: CreateCommentDto = {
                content: 'This is a reply',
                userId: 'user-2',
                parentId: 'comment-1',
                projectId: 'project-1'
            };

            const reply = { ...mockComment, id: 'reply-1', parentId: 'comment-1' };
            mockCommentService.create.mockResolvedValue(reply);

            const result = await controller.create(createReplyDto);

            expect(result).toEqual(reply);
            expect(mockCommentService.create).toHaveBeenCalledWith(createReplyDto);
        });
    });

    describe('findAll', () => {
        it('should return all comments', async () => {
            const comments = [mockComment];
            mockCommentService.findAll.mockResolvedValue(comments);

            const result = await controller.findAll();

            expect(result).toEqual(comments);
            expect(mockCommentService.findAll).toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return comments by user', async () => {
            const comments = [mockComment];
            mockCommentService.findByUser.mockResolvedValue(comments);

            const result = await controller.findByUser('user-1');

            expect(result).toEqual(comments);
            expect(mockCommentService.findByUser).toHaveBeenCalledWith('user-1');
        });
    });

    describe('findByProject', () => {
        it('should return comments for a project', async () => {
            const comments = [mockCommentWithUser];
            mockCommentService.findByProject.mockResolvedValue(comments);

            const result = await controller.findByProject('project-1');

            expect(result).toEqual(comments);
            expect(mockCommentService.findByProject).toHaveBeenCalledWith('project-1');
        });
    });

    describe('findByPost', () => {
        it('should return comments for a post', async () => {
            const comments = [mockCommentWithUser];
            mockCommentService.findByPost.mockResolvedValue(comments);

            const result = await controller.findByPost('post-1');

            expect(result).toEqual(comments);
            expect(mockCommentService.findByPost).toHaveBeenCalledWith('post-1');
        });
    });

    describe('findReplies', () => {
        it('should return replies for a comment', async () => {
            const replies = [mockCommentWithUser];
            mockCommentService.findReplies.mockResolvedValue(replies);

            const result = await controller.findReplies('comment-1');

            expect(result).toEqual(replies);
            expect(mockCommentService.findReplies).toHaveBeenCalledWith('comment-1');
        });
    });

    describe('getProjectCommentStats', () => {
        it('should return project comment statistics', async () => {
            const stats = {
                totalComments: 10,
                topLevelComments: 7,
                replies: 3
            };
            mockCommentService.getProjectCommentStats.mockResolvedValue(stats);

            const result = await controller.getProjectCommentStats('project-1');

            expect(result).toEqual(stats);
            expect(mockCommentService.getProjectCommentStats).toHaveBeenCalledWith('project-1');
        });
    });

    describe('getPostCommentStats', () => {
        it('should return post comment statistics', async () => {
            const stats = {
                totalComments: 15,
                topLevelComments: 12,
                replies: 3
            };
            mockCommentService.getPostCommentStats.mockResolvedValue(stats);

            const result = await controller.getPostCommentStats('post-1');

            expect(result).toEqual(stats);
            expect(mockCommentService.getPostCommentStats).toHaveBeenCalledWith('post-1');
        });
    });

    describe('search', () => {
        it('should search comments by content', async () => {
            const searchResults = [mockComment];
            mockCommentService.search.mockResolvedValue(searchResults);

            const result = await controller.search('test');

            expect(result).toEqual(searchResults);
            expect(mockCommentService.search).toHaveBeenCalledWith('test', ['content']);
        });
    });

    describe('paginate', () => {
        it('should return paginated comments', async () => {
            const paginatedResult = [mockComment];
            mockCommentService.paginate.mockResolvedValue(paginatedResult);

            const result = await controller.paginate('0', '10');

            expect(result).toEqual(paginatedResult);
            expect(mockCommentService.paginate).toHaveBeenCalledWith(0, 10);
        });

        it('should handle optional parameters', async () => {
            const paginatedResult = [mockComment];
            mockCommentService.paginate.mockResolvedValue(paginatedResult);

            const result = await controller.paginate();

            expect(result).toEqual(paginatedResult);
            expect(mockCommentService.paginate).toHaveBeenCalledWith(0, 10);
        });
    });

    describe('findOne', () => {
        it('should return a comment by id', async () => {
            mockCommentService.findOne.mockResolvedValue(mockComment);

            const result = await controller.findOne('comment-1');

            expect(result).toEqual(mockComment);
            expect(mockCommentService.findOne).toHaveBeenCalledWith('comment-1');
        });
    });

    describe('update', () => {
        it('should update a comment', async () => {
            const updateCommentDto: UpdateCommentDto = {
                content: 'Updated comment content'
            };
            const updatedComment = { ...mockComment, content: 'Updated comment content' };
            mockCommentService.update.mockResolvedValue(updatedComment);

            const result = await controller.update('comment-1', updateCommentDto);

            expect(result).toEqual(updatedComment);
            expect(mockCommentService.update).toHaveBeenCalledWith('comment-1', updateCommentDto);
        });
    });

    describe('incrementLikes', () => {
        it('should increment likes for a comment', async () => {
            const updatedComment = { ...mockComment, nbLikes: 1 };
            mockCommentService.incrementLikes.mockResolvedValue(updatedComment);

            const result = await controller.incrementLikes('comment-1');

            expect(result).toEqual(updatedComment);
            expect(mockCommentService.incrementLikes).toHaveBeenCalledWith('comment-1');
        });
    });

    describe('decrementLikes', () => {
        it('should decrement likes for a comment', async () => {
            const updatedComment = { ...mockComment, nbLikes: -1 };
            mockCommentService.decrementLikes.mockResolvedValue(updatedComment);

            const result = await controller.decrementLikes('comment-1');

            expect(result).toEqual(updatedComment);
            expect(mockCommentService.decrementLikes).toHaveBeenCalledWith('comment-1');
        });
    });

    describe('remove', () => {
        it('should remove a comment', async () => {
            mockCommentService.remove.mockResolvedValue(mockComment);

            const result = await controller.remove('comment-1');

            expect(result).toEqual(mockComment);
            expect(mockCommentService.remove).toHaveBeenCalledWith('comment-1');
        });
    });
});
