import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Post } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('PostService', () => {
    let service: PostService;

    const mockPost: Post = {
        id: 'test-post-id',
        userId: 'test-user-id',
        title: 'Test post title',
        content: 'Test post content',
        nbLikes: 0,
        nbComments: 0,
        nbShares: 0,
        nbViews: 0,
        isPublic: true,
        mlPrediction: null,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockPrismaService = {
        post: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<PostService>(PostService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new post', async () => {
            const createPostDto: CreatePostDto = {
                userId: 'test-user-id',
                title: 'Test post title',
                content: 'Test post content',
                isPublic: true
            };

            mockPrismaService.post.create.mockResolvedValue(mockPost);

            const result = await service.create(createPostDto);

            expect(mockPrismaService.post.create).toHaveBeenCalledWith({
                data: createPostDto
            });
            expect(result).toEqual(mockPost);
        });
    });

    describe('findAll', () => {
        it('should return an array of posts', async () => {
            const posts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(posts);

            const result = await service.findAll();

            expect(mockPrismaService.post.findMany).toHaveBeenCalled();
            expect(result).toEqual(posts);
        });
    });

    describe('findOne', () => {
        it('should return a post by id', async () => {
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

            const result = await service.findOne('test-post-id');

            expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-post-id' }
            });
            expect(result).toEqual(mockPost);
        });

        it('should throw NotFoundException when post not found', async () => {
            mockPrismaService.post.findUnique.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('update', () => {
        it('should update a post', async () => {
            const updatePostDto: UpdatePostDto = {
                content: 'Updated content',
                nbLikes: 5
            };

            const updatedPost = { ...mockPost, ...updatePostDto };
            mockPrismaService.post.update.mockResolvedValue(updatedPost);

            const result = await service.update('test-post-id', updatePostDto);

            expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                where: { id: 'test-post-id' },
                data: updatePostDto
            });
            expect(result).toEqual(updatedPost);
        });
    });

    describe('remove', () => {
        it('should delete a post', async () => {
            mockPrismaService.post.delete.mockResolvedValue(mockPost);

            const result = await service.remove('test-post-id');

            expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
                where: { id: 'test-post-id' }
            });
            expect(result).toEqual(mockPost);
        });
    });

    describe('findByUser', () => {
        it('should return posts by user id', async () => {
            const posts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(posts);

            const result = await service.findByUser('test-user-id');

            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                where: { userId: 'test-user-id' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(posts);
        });
    });

    describe('findPublicPosts', () => {
        it('should return only public posts', async () => {
            const publicPosts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(publicPosts);

            const result = await service.findPublicPosts();

            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                where: { isPublic: true },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(publicPosts);
        });
    });

    describe('findAllPaginated', () => {
        it('should return paginated posts', async () => {
            const posts = [mockPost];
            const total = 1;

            mockPrismaService.post.findMany.mockResolvedValue(posts);
            mockPrismaService.post.count.mockResolvedValue(total);

            const paginationDto = { page: 1, limit: 20 };
            const result = await service.findAllPaginated(paginationDto);

            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 20,
                orderBy: { createdAt: 'desc' }
            });

            expect(result).toEqual({
                data: posts,
                meta: {
                    total: 1,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        });

        it('should use default pagination values', async () => {
            const posts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(posts);
            mockPrismaService.post.count.mockResolvedValue(1);

            await service.findAllPaginated({});

            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 20, // Default limit for mobile
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findPublicPostsPaginated', () => {
        it('should return paginated public posts', async () => {
            const posts = [mockPost];
            const total = 1;

            mockPrismaService.post.findMany.mockResolvedValue(posts);
            mockPrismaService.post.count.mockResolvedValue(total);

            const paginationDto = { page: 1, limit: 10 };
            const result =
                await service.findPublicPostsPaginated(paginationDto);

            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                where: { isPublic: true },
                skip: 0,
                take: 10,
                orderBy: { createdAt: 'desc' }
            });

            expect(mockPrismaService.post.count).toHaveBeenCalledWith({
                where: { isPublic: true }
            });

            expect(result.data).toEqual(posts);
            expect(result.meta.total).toBe(1);
        });
    });

    describe('increment methods', () => {
        describe('incrementLikes', () => {
            it('should increment likes count', async () => {
                const updatedPost = { ...mockPost, nbLikes: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const result = await service.incrementLikes('test-post-id');

                expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                    where: { id: 'test-post-id' },
                    data: {
                        nbLikes: {
                            increment: 1
                        }
                    }
                });
                expect(result).toEqual(updatedPost);
            });
        });

        describe('incrementViews', () => {
            it('should increment views count', async () => {
                const updatedPost = { ...mockPost, nbViews: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const result = await service.incrementViews('test-post-id');

                expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                    where: { id: 'test-post-id' },
                    data: {
                        nbViews: {
                            increment: 1
                        }
                    }
                });
                expect(result).toEqual(updatedPost);
            });
        });

        describe('incrementComments', () => {
            it('should increment comments count', async () => {
                const updatedPost = { ...mockPost, nbComments: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const result = await service.incrementComments('test-post-id');

                expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                    where: { id: 'test-post-id' },
                    data: {
                        nbComments: {
                            increment: 1
                        }
                    }
                });
                expect(result).toEqual(updatedPost);
            });
        });

        describe('incrementShares', () => {
            it('should increment shares count', async () => {
                const updatedPost = { ...mockPost, nbShares: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const result = await service.incrementShares('test-post-id');

                expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                    where: { id: 'test-post-id' },
                    data: {
                        nbShares: {
                            increment: 1
                        }
                    }
                });
                expect(result).toEqual(updatedPost);
            });
        });
    });

    describe('findAllWithRelations', () => {
        it('should return posts with all relations', async () => {
            const postsWithRelations = [
                {
                    ...mockPost,
                    user: {
                        id: 'user-id',
                        name: 'Test User',
                        email: 'test@example.com'
                    },
                    media: [],
                    Like: [],
                    Comment: [],
                    PostSector: [],
                    PostTag: []
                }
            ];

            mockPrismaService.post.findMany.mockResolvedValue(
                postsWithRelations
            );

            const result = await service.findAllWithRelations();

            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    media: true,
                    Like: true,
                    Comment: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    PostSector: {
                        include: {
                            sector: true
                        }
                    },
                    PostTag: {
                        include: {
                            tag: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            expect(result).toEqual(postsWithRelations);
        });
    });

    describe('findOneWithRelations', () => {
        it('should return a post with all relations', async () => {
            const postWithRelations = {
                ...mockPost,
                user: {
                    id: 'user-id',
                    name: 'Test User',
                    email: 'test@example.com'
                },
                media: [],
                Like: [],
                Comment: [],
                PostSector: [],
                PostTag: []
            };

            mockPrismaService.post.findUnique.mockResolvedValue(
                postWithRelations
            );

            const result = await service.findOneWithRelations('test-post-id');

            expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-post-id' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    media: true,
                    Like: true,
                    Comment: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    },
                    PostSector: {
                        include: {
                            sector: true
                        }
                    },
                    PostTag: {
                        include: {
                            tag: true
                        }
                    }
                }
            });

            expect(result).toEqual(postWithRelations);
        });
    });
});
