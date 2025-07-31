import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from '../post.controller';
import { PostService } from '../post.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '@prisma/client';

describe('PostController', () => {
    let controller: PostController;
    let service: PostService;

    const mockPost: Post = {
        id: 'test-post-id',
        userId: 'test-user-id',
        content: 'Test post content',
        title: 'Test post title',
        nbLikes: 0,
        nbComments: 0,
        nbShares: 0,
        nbViews: 0,
        isPublic: true,
        mlPrediction: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockPostService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        findByUser: jest.fn(),
        findPublicPosts: jest.fn(),
        findAllPaginated: jest.fn(),
        findPublicPostsPaginated: jest.fn(),
        findAllWithRelations: jest.fn(),
        findOneWithRelations: jest.fn(),
        incrementLikes: jest.fn(),
        incrementViews: jest.fn(),
        incrementComments: jest.fn(),
        incrementShares: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostController],
            providers: [
                {
                    provide: PostService,
                    useValue: mockPostService
                }
            ]
        }).compile();

        controller = module.get<PostController>(PostController);
        service = module.get<PostService>(PostService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new post', async () => {
            const createPostDto: CreatePostDto = {
                userId: 'test-user-id',
                content: 'Test post content',
                title: 'Test post title',
                isPublic: true
            };

            mockPostService.create.mockResolvedValue(mockPost);

            const result = await controller.create(createPostDto);

            expect(service.create).toHaveBeenCalledWith(createPostDto);
            expect(result).toEqual(mockPost);
        });
    });

    describe('findAll', () => {
        it('should return all posts without pagination or relations', async () => {
            const posts = [mockPost];
            mockPostService.findAll.mockResolvedValue(posts);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(posts);
        });

        it('should return paginated posts when pagination params provided', async () => {
            const paginatedResult = {
                data: [mockPost],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            };

            mockPostService.findAllPaginated.mockResolvedValue(paginatedResult);

            const result = await controller.findAll(false, '1', '20');

            expect(service.findAllPaginated).toHaveBeenCalledWith({ page: 1, limit: 20 });
            expect(result).toEqual(paginatedResult);
        });

        it('should return posts with relations when withRelations is true', async () => {
            const postsWithRelations = [
                {
                    ...mockPost,
                    user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
                    media: []
                }
            ];

            mockPostService.findAllWithRelations.mockResolvedValue(postsWithRelations);

            const result = await controller.findAll(true);

            expect(service.findAllWithRelations).toHaveBeenCalled();
            expect(result).toEqual(postsWithRelations);
        });
    });

    describe('findPublicPosts', () => {
        it('should return public posts without pagination', async () => {
            const publicPosts = [mockPost];
            mockPostService.findPublicPosts.mockResolvedValue(publicPosts);

            const result = await controller.findPublicPosts();

            expect(service.findPublicPosts).toHaveBeenCalled();
            expect(result).toEqual(publicPosts);
        });

        it('should return paginated public posts when pagination params provided', async () => {
            const paginatedResult = {
                data: [mockPost],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            };

            mockPostService.findPublicPostsPaginated.mockResolvedValue(paginatedResult);

            const result = await controller.findPublicPosts('1', '10');

            expect(service.findPublicPostsPaginated).toHaveBeenCalledWith({ page: 1, limit: 10 });
            expect(result).toEqual(paginatedResult);
        });
    });

    describe('findByUser', () => {
        it('should return posts by user ID', async () => {
            const userPosts = [mockPost];
            mockPostService.findByUser.mockResolvedValue(userPosts);

            const result = await controller.findByUser('test-user-id');

            expect(service.findByUser).toHaveBeenCalledWith('test-user-id');
            expect(result).toEqual(userPosts);
        });
    });

    describe('findOne', () => {
        it('should return a post by ID without relations', async () => {
            mockPostService.findOne.mockResolvedValue(mockPost);

            const result = await controller.findOne('test-post-id');

            expect(service.findOne).toHaveBeenCalledWith('test-post-id');
            expect(result).toEqual(mockPost);
        });

        it('should return a post with relations when withRelations is true', async () => {
            const postWithRelations = {
                ...mockPost,
                user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
                media: []
            };

            mockPostService.findOneWithRelations.mockResolvedValue(postWithRelations);

            const result = await controller.findOne('test-post-id', true);

            expect(service.findOneWithRelations).toHaveBeenCalledWith('test-post-id');
            expect(result).toEqual(postWithRelations);
        });
    });

    describe('update', () => {
        it('should update a post', async () => {
            const updatePostDto: UpdatePostDto = {
                content: 'Updated content',
                nbLikes: 5
            };

            const updatedPost = { ...mockPost, ...updatePostDto };
            mockPostService.update.mockResolvedValue(updatedPost);

            const result = await controller.update('test-post-id', updatePostDto);

            expect(service.update).toHaveBeenCalledWith('test-post-id', updatePostDto);
            expect(result).toEqual(updatedPost);
        });
    });

    describe('remove', () => {
        it('should delete a post', async () => {
            mockPostService.remove.mockResolvedValue(mockPost);

            const result = await controller.remove('test-post-id');

            expect(service.remove).toHaveBeenCalledWith('test-post-id');
            expect(result).toEqual(mockPost);
        });
    });

    describe('increment methods', () => {
        describe('incrementLikes', () => {
            it('should increment likes count', async () => {
                const updatedPost = { ...mockPost, nbLikes: 1 };
                mockPostService.incrementLikes.mockResolvedValue(updatedPost);

                const result = await controller.incrementLikes('test-post-id');

                expect(service.incrementLikes).toHaveBeenCalledWith('test-post-id');
                expect(result).toEqual(updatedPost);
            });
        });

        describe('incrementViews', () => {
            it('should increment views count', async () => {
                const updatedPost = { ...mockPost, nbViews: 1 };
                mockPostService.incrementViews.mockResolvedValue(updatedPost);

                const result = await controller.incrementViews('test-post-id');

                expect(service.incrementViews).toHaveBeenCalledWith('test-post-id');
                expect(result).toEqual(updatedPost);
            });
        });

        describe('incrementComments', () => {
            it('should increment comments count', async () => {
                const updatedPost = { ...mockPost, nbComments: 1 };
                mockPostService.incrementComments.mockResolvedValue(updatedPost);

                const result = await controller.incrementComments('test-post-id');

                expect(service.incrementComments).toHaveBeenCalledWith('test-post-id');
                expect(result).toEqual(updatedPost);
            });
        });

        describe('incrementShares', () => {
            it('should increment shares count', async () => {
                const updatedPost = { ...mockPost, nbShares: 1 };
                mockPostService.incrementShares.mockResolvedValue(updatedPost);

                const result = await controller.incrementShares('test-post-id');

                expect(service.incrementShares).toHaveBeenCalledWith('test-post-id');
                expect(result).toEqual(updatedPost);
            });
        });
    });
});
