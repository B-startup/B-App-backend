import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PostSharedModule } from '../post-shared.module';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreatePostSharedDto } from '../dto/create-post-shared.dto';
import { UpdatePostSharedDto } from '../dto/update-post-shared.dto';

describe('PostShared Integration Tests', () => {
    let app: INestApplication;

    const mockPrismaService = {
        postShared: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn()
        },
        post: {
            findUnique: jest.fn(),
            update: jest.fn()
        },
        user: {
            findUnique: jest.fn()
        }
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [PostSharedModule]
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

    const mockPostShared = {
        id: 'test-share-id',
        postId: 'test-post-id',
        userId: 'test-user-id',
        description: 'Check out this amazing post!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const mockPost = {
        id: 'test-post-id',
        title: 'Test Post',
        content: 'Test content',
        nbShares: 0
    };

    const mockUser = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
    };

    describe('/post-shared (POST)', () => {
        it('should share a post successfully', async () => {
            const createPostSharedDto: CreatePostSharedDto = {
                postId: 'test-post-id',
                userId: 'test-user-id',
                description: 'Check out this amazing post!'
            };

            // Mock service calls
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.postShared.create.mockResolvedValue(mockPostShared);
            mockPrismaService.post.update.mockResolvedValue({
                ...mockPost,
                nbShares: 1
            });

            const response = await request(app.getHttpServer())
                .post('/post-shared')
                .send(createPostSharedDto)
                .expect(201);

            expect(response.body).toEqual(mockPostShared);
        });

        it('should return 409 if user already shared the post', async () => {
            const createPostSharedDto: CreatePostSharedDto = {
                postId: 'test-post-id',
                userId: 'test-user-id'
            };

            mockPrismaService.postShared.findFirst.mockResolvedValue(mockPostShared);

            await request(app.getHttpServer())
                .post('/post-shared')
                .send(createPostSharedDto)
                .expect(409);
        });
    });

    describe('/post-shared (GET)', () => {
        it('should return all post shares', async () => {
            const shares = [mockPostShared];
            mockPrismaService.postShared.findMany.mockResolvedValue(shares);

            const response = await request(app.getHttpServer())
                .get('/post-shared')
                .expect(200);

            expect(response.body).toEqual(shares);
        });
    });

    describe('/post-shared/post/:postId (GET)', () => {
        it('should return shares for a specific post', async () => {
            const shares = [mockPostShared];
            mockPrismaService.postShared.findMany.mockResolvedValue(shares);

            const response = await request(app.getHttpServer())
                .get('/post-shared/post/test-post-id')
                .expect(200);

            expect(response.body).toEqual(shares);
        });

        it('should return shares with user information when withUsers=true', async () => {
            const sharesWithUsers = [
                {
                    ...mockPostShared,
                    user: {
                        id: 'test-user-id',
                        name: 'Test User',
                        profilePicture: null
                    }
                }
            ];
            mockPrismaService.postShared.findMany.mockResolvedValue(sharesWithUsers);

            const response = await request(app.getHttpServer())
                .get('/post-shared/post/test-post-id?withUsers=true')
                .expect(200);

            expect(response.body).toEqual(sharesWithUsers);
        });
    });

    describe('/post-shared/user/:userId (GET)', () => {
        it('should return shares by a specific user', async () => {
            const userShares = [mockPostShared];
            mockPrismaService.postShared.findMany.mockResolvedValue(userShares);

            const response = await request(app.getHttpServer())
                .get('/post-shared/user/test-user-id')
                .expect(200);

            expect(response.body).toEqual(userShares);
        });

        it('should return user shares with post details when withPosts=true', async () => {
            const sharesWithPosts = [
                {
                    ...mockPostShared,
                    post: {
                        id: 'test-post-id',
                        title: 'Test Post',
                        content: 'Test content',
                        createdAt: new Date().toISOString(),
                        user: {
                            id: 'post-creator-id',
                            name: 'Post Creator',
                            profilePicture: null
                        }
                    }
                }
            ];
            mockPrismaService.postShared.findMany.mockResolvedValue(sharesWithPosts);

            const response = await request(app.getHttpServer())
                .get('/post-shared/user/test-user-id?withPosts=true')
                .expect(200);

            expect(response.body).toEqual(sharesWithPosts);
        });
    });

    describe('/post-shared/post/:postId/count (GET)', () => {
        it('should return share count for a post', async () => {
            mockPrismaService.postShared.count.mockResolvedValue(5);

            const response = await request(app.getHttpServer())
                .get('/post-shared/post/test-post-id/count')
                .expect(200);

            expect(response.body).toEqual({ count: 5 });
        });
    });

    describe('/post-shared/user/:userId/count (GET)', () => {
        it('should return share count for a user', async () => {
            mockPrismaService.postShared.count.mockResolvedValue(3);

            const response = await request(app.getHttpServer())
                .get('/post-shared/user/test-user-id/count')
                .expect(200);

            expect(response.body).toEqual({ count: 3 });
        });
    });

    describe('/post-shared/:id (GET)', () => {
        it('should return a specific post share', async () => {
            mockPrismaService.postShared.findUnique.mockResolvedValue(mockPostShared);

            const response = await request(app.getHttpServer())
                .get('/post-shared/test-share-id')
                .expect(200);

            expect(response.body).toEqual(mockPostShared);
        });

        it('should return 404 if post share not found', async () => {
            mockPrismaService.postShared.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .get('/post-shared/non-existent-id')
                .expect(404);
        });
    });

    describe('/post-shared/:id (PATCH)', () => {
        it('should update a post share', async () => {
            const updatePostSharedDto: UpdatePostSharedDto = {
                description: 'Updated description'
            };
            const updatedShare = { ...mockPostShared, ...updatePostSharedDto };
            mockPrismaService.postShared.update.mockResolvedValue(updatedShare);

            const response = await request(app.getHttpServer())
                .patch('/post-shared/test-share-id')
                .send(updatePostSharedDto)
                .expect(200);

            expect(response.body).toEqual(updatedShare);
        });
    });

    describe('/post-shared/:id (DELETE)', () => {
        it('should delete a post share', async () => {
            mockPrismaService.postShared.delete.mockResolvedValue(mockPostShared);

            const response = await request(app.getHttpServer())
                .delete('/post-shared/test-share-id')
                .expect(200);

            expect(response.body).toEqual(mockPostShared);
        });
    });

    describe('/post-shared/unshare/:userId/:postId (DELETE)', () => {
        it('should unshare a post', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(mockPostShared);
            mockPrismaService.postShared.delete.mockResolvedValue(mockPostShared);
            mockPrismaService.post.update.mockResolvedValue({
                ...mockPost,
                nbShares: 0
            });

            const response = await request(app.getHttpServer())
                .delete('/post-shared/unshare/test-user-id/test-post-id')
                .expect(200);

            expect(response.body).toEqual(mockPostShared);
        });

        it('should return 404 if share not found', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);

            await request(app.getHttpServer())
                .delete('/post-shared/unshare/test-user-id/test-post-id')
                .expect(404);
        });
    });
});
