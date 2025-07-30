import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostModule } from '../post.module';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';

describe('Post Integration Tests', () => {
    let app: INestApplication;

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
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [PostModule]
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
        jest.clearAllMocks();
    });

    const mockPost = {
        id: 'test-post-id',
        userId: 'test-user-id',
        content: 'Test post content',
        nbLikes: 0,
        nbComments: 0,
        nbShares: 0,
        nbViews: 0,
        isPublic: true,
        mlPrediction: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    describe('/posts (POST)', () => {
        it('should create a new post', async () => {
            const createPostDto: CreatePostDto = {
                userId: 'test-user-id',
                content: 'Test post content',
                isPublic: true
            };

            mockPrismaService.post.create.mockResolvedValue(mockPost);

            const response = await request(app.getHttpServer())
                .post('/posts')
                .send(createPostDto)
                .expect(201);

            expect(response.body).toEqual(mockPost);
            expect(mockPrismaService.post.create).toHaveBeenCalledWith({
                data: createPostDto
            });
        });
    });

    describe('/posts (GET)', () => {
        it('should return all posts', async () => {
            const posts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(posts);

            const response = await request(app.getHttpServer())
                .get('/posts')
                .expect(200);

            expect(response.body).toEqual(posts);
        });

        it('should return paginated posts', async () => {
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

            mockPrismaService.post.findMany.mockResolvedValue([mockPost]);
            mockPrismaService.post.count.mockResolvedValue(1);

            const response = await request(app.getHttpServer())
                .get('/posts?page=1&limit=20')
                .expect(200);

            expect(response.body).toEqual(paginatedResult);
        });

        it('should return posts with relations', async () => {
            const postsWithRelations = [
                {
                    ...mockPost,
                    user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
                    media: [],
                    Like: [],
                    Comment: [],
                    PostSector: [],
                    PostTag: []
                }
            ];

            mockPrismaService.post.findMany.mockResolvedValue(postsWithRelations);

            const response = await request(app.getHttpServer())
                .get('/posts?withRelations=true')
                .expect(200);

            expect(response.body).toEqual(postsWithRelations);
        });
    });

    describe('/posts/public (GET)', () => {
        it('should return public posts', async () => {
            const publicPosts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(publicPosts);

            const response = await request(app.getHttpServer())
                .get('/posts/public')
                .expect(200);

            expect(response.body).toEqual(publicPosts);
            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                where: { isPublic: true },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('/posts/user/:userId (GET)', () => {
        it('should return posts by user', async () => {
            const userPosts = [mockPost];
            mockPrismaService.post.findMany.mockResolvedValue(userPosts);

            const response = await request(app.getHttpServer())
                .get('/posts/user/test-user-id')
                .expect(200);

            expect(response.body).toEqual(userPosts);
            expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
                where: { userId: 'test-user-id' },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('/posts/:id (GET)', () => {
        it('should return a post by ID', async () => {
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

            const response = await request(app.getHttpServer())
                .get('/posts/test-post-id')
                .expect(200);

            expect(response.body).toEqual(mockPost);
            expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-post-id' }
            });
        });

        it('should return 404 for non-existent post', async () => {
            mockPrismaService.post.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .get('/posts/non-existent-id')
                .expect(404);
        });
    });

    describe('/posts/:id (PATCH)', () => {
        it('should update a post', async () => {
            const updatePostDto: UpdatePostDto = {
                content: 'Updated content',
                nbLikes: 5
            };

            const updatedPost = { ...mockPost, ...updatePostDto };
            mockPrismaService.post.update.mockResolvedValue(updatedPost);

            const response = await request(app.getHttpServer())
                .patch('/posts/test-post-id')
                .send(updatePostDto)
                .expect(200);

            expect(response.body).toEqual(updatedPost);
            expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                where: { id: 'test-post-id' },
                data: updatePostDto
            });
        });
    });

    describe('/posts/:id (DELETE)', () => {
        it('should delete a post', async () => {
            mockPrismaService.post.delete.mockResolvedValue(mockPost);

            const response = await request(app.getHttpServer())
                .delete('/posts/test-post-id')
                .expect(200);

            expect(response.body).toEqual(mockPost);
            expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
                where: { id: 'test-post-id' }
            });
        });
    });

    describe('Increment endpoints', () => {
        describe('/posts/:id/like (PATCH)', () => {
            it('should increment likes', async () => {
                const updatedPost = { ...mockPost, nbLikes: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const response = await request(app.getHttpServer())
                    .patch('/posts/test-post-id/like')
                    .expect(200);

                expect(response.body).toEqual(updatedPost);
                expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                    where: { id: 'test-post-id' },
                    data: { nbLikes: { increment: 1 } }
                });
            });
        });

        describe('/posts/:id/view (PATCH)', () => {
            it('should increment views', async () => {
                const updatedPost = { ...mockPost, nbViews: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const response = await request(app.getHttpServer())
                    .patch('/posts/test-post-id/view')
                    .expect(200);

                expect(response.body).toEqual(updatedPost);
            });
        });

        describe('/posts/:id/comment (PATCH)', () => {
            it('should increment comments', async () => {
                const updatedPost = { ...mockPost, nbComments: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const response = await request(app.getHttpServer())
                    .patch('/posts/test-post-id/comment')
                    .expect(200);

                expect(response.body).toEqual(updatedPost);
            });
        });

        describe('/posts/:id/share (PATCH)', () => {
            it('should increment shares', async () => {
                const updatedPost = { ...mockPost, nbShares: 1 };
                mockPrismaService.post.update.mockResolvedValue(updatedPost);

                const response = await request(app.getHttpServer())
                    .patch('/posts/test-post-id/share')
                    .expect(200);

                expect(response.body).toEqual(updatedPost);
            });
        });
    });
});
