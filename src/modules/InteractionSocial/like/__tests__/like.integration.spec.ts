import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LikeModule } from '../like.module';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CounterService } from '../../../../core/common/services/counter.service';

describe('LikeController (Integration)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    const mockLike = {
        id: 'like-1',
        userId: 'user-1',
        projectId: 'project-1',
        postId: null,
        commentId: null,
        createdAt: new Date('2025-07-31T10:00:00.000Z'),
        updatedAt: new Date('2025-07-31T10:00:00.000Z')
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [LikeModule]
        })
            .overrideProvider(PrismaService)
            .useValue({
                like: {
                    create: jest.fn().mockResolvedValue(mockLike),
                    findMany: jest.fn().mockResolvedValue([mockLike]),
                    findUnique: jest.fn().mockResolvedValue(mockLike),
                    findFirst: jest.fn().mockResolvedValue(null),
                    update: jest.fn().mockResolvedValue(mockLike),
                    delete: jest.fn().mockResolvedValue(mockLike),
                    count: jest.fn().mockResolvedValue(1)
                }
            })
            .overrideProvider(CounterService)
            .useValue({
                updateCommentCount: jest.fn().mockResolvedValue(undefined),
                updateLikeCount: jest.fn().mockResolvedValue(undefined),
                updateViewCount: jest.fn().mockResolvedValue(undefined),
                recalculateCounters: jest.fn().mockResolvedValue(undefined)
            })
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /likes', () => {
        it('should create a new like', async () => {
            const createLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            const response = await request(app.getHttpServer())
                .post('/likes')
                .send(createLikeDto)
                .expect(201);

            expect(response.body).toEqual(mockLike);
            expect(prismaService.like.create).toHaveBeenCalledWith({
                data: createLikeDto
            });
        });

        it('should return 400 for invalid data', async () => {
            const invalidDto = {
                userId: 'invalid-uuid', // Invalid UUID
                projectId: 'project-1'
            };

            await request(app.getHttpServer())
                .post('/likes')
                .send(invalidDto)
                .expect(400);
        });

        it('should return 409 when like already exists', async () => {
            // Mock existing like
            prismaService.like.findFirst = jest
                .fn()
                .mockResolvedValue(mockLike);

            const createLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            await request(app.getHttpServer())
                .post('/likes')
                .send(createLikeDto)
                .expect(409);
        });
    });

    describe('POST /likes/toggle', () => {
        it('should toggle like (create)', async () => {
            const createLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            // Mock no existing like
            prismaService.like.findFirst = jest.fn().mockResolvedValue(null);

            const response = await request(app.getHttpServer())
                .post('/likes/toggle')
                .send(createLikeDto)
                .expect(201);

            expect(response.body).toEqual({ liked: true, like: mockLike });
        });

        it('should toggle like (remove)', async () => {
            const createLikeDto = {
                userId: 'user-1',
                projectId: 'project-1'
            };

            // Mock existing like
            prismaService.like.findFirst = jest
                .fn()
                .mockResolvedValue(mockLike);
            prismaService.like.findUnique = jest
                .fn()
                .mockResolvedValue(mockLike);

            const response = await request(app.getHttpServer())
                .post('/likes/toggle')
                .send(createLikeDto)
                .expect(201);

            expect(response.body).toEqual({ liked: false });
        });
    });

    describe('GET /likes', () => {
        it('should return all likes', async () => {
            const response = await request(app.getHttpServer())
                .get('/likes')
                .expect(200);

            expect(response.body).toEqual([mockLike]);
            expect(prismaService.like.findMany).toHaveBeenCalled();
        });
    });

    describe('GET /likes/project/:projectId', () => {
        it('should return likes for a project', async () => {
            const response = await request(app.getHttpServer())
                .get('/likes/project/project-1')
                .expect(200);

            expect(response.body).toEqual([mockLike]);
        });

        it('should return 400 for invalid UUID', async () => {
            await request(app.getHttpServer())
                .get('/likes/project/invalid-uuid')
                .expect(400);
        });
    });

    describe('GET /likes/project/:projectId/count', () => {
        it('should return project like count', async () => {
            prismaService.like.count = jest.fn().mockResolvedValue(5);

            const response = await request(app.getHttpServer())
                .get('/likes/project/project-1/count')
                .expect(200);

            expect(response.body).toBe(5);
        });
    });

    describe('GET /likes/post/:postId', () => {
        it('should return likes for a post', async () => {
            const response = await request(app.getHttpServer())
                .get('/likes/post/post-1')
                .expect(200);

            expect(response.body).toEqual([mockLike]);
        });
    });

    describe('GET /likes/comment/:commentId', () => {
        it('should return likes for a comment', async () => {
            const response = await request(app.getHttpServer())
                .get('/likes/comment/comment-1')
                .expect(200);

            expect(response.body).toEqual([mockLike]);
        });
    });

    describe('GET /likes/check/:userId/:targetId', () => {
        it('should check if user has liked an item', async () => {
            prismaService.like.findFirst = jest
                .fn()
                .mockResolvedValue(mockLike);

            const response = await request(app.getHttpServer())
                .get('/likes/check/user-1/project-1?type=project')
                .expect(200);

            expect(response.body).toEqual({ hasLiked: true });
        });

        it('should return false when user has not liked an item', async () => {
            prismaService.like.findFirst = jest.fn().mockResolvedValue(null);

            const response = await request(app.getHttpServer())
                .get('/likes/check/user-1/project-1?type=project')
                .expect(200);

            expect(response.body).toEqual({ hasLiked: false });
        });
    });

    describe('GET /likes/user/:userId/activity', () => {
        it('should return user like activity', async () => {
            const activity = {
                totalLikes: 18,
                projectLikes: 5,
                postLikes: 10,
                commentLikes: 3
            };

            prismaService.like.count = jest
                .fn()
                .mockResolvedValueOnce(5) // project likes
                .mockResolvedValueOnce(10) // post likes
                .mockResolvedValueOnce(3); // comment likes

            const response = await request(app.getHttpServer())
                .get('/likes/user/user-1/activity')
                .expect(200);

            expect(response.body).toEqual(activity);
        });
    });

    describe('DELETE /likes/:id', () => {
        it('should delete a like', async () => {
            const response = await request(app.getHttpServer())
                .delete('/likes/like-1')
                .expect(200);

            expect(response.body).toEqual(mockLike);
            expect(prismaService.like.delete).toHaveBeenCalledWith({
                where: { id: 'like-1' }
            });
        });
    });
});
