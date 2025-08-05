import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CommentModule } from '../comment.module';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CounterService } from '../../../../core/common/services/counter.service';

describe('CommentController (Integration)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;

    const mockComment = {
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

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CommentModule]
        })
            .overrideProvider(PrismaService)
            .useValue({
                comment: {
                    create: jest.fn().mockResolvedValue(mockComment),
                    findMany: jest.fn().mockResolvedValue([mockComment]),
                    findUnique: jest.fn().mockResolvedValue(mockComment),
                    findFirst: jest.fn().mockResolvedValue(mockComment),
                    update: jest.fn().mockResolvedValue(mockComment),
                    delete: jest.fn().mockResolvedValue(mockComment),
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

    describe('POST /comments', () => {
        it('should create a new comment', async () => {
            const createCommentDto = {
                content: 'Test comment',
                userId: 'user-1',
                projectId: 'project-1'
            };

            const response = await request(app.getHttpServer())
                .post('/comments')
                .send(createCommentDto)
                .expect(201);

            expect(response.body).toEqual(mockComment);
            expect(prismaService.comment.create).toHaveBeenCalledWith({
                data: createCommentDto
            });
        });

        it('should return 400 for invalid data', async () => {
            const invalidDto = {
                content: '', // Invalid empty content
                userId: 'user-1',
                projectId: 'project-1'
            };

            await request(app.getHttpServer())
                .post('/comments')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('GET /comments', () => {
        it('should return all comments', async () => {
            const response = await request(app.getHttpServer())
                .get('/comments')
                .expect(200);

            expect(response.body).toEqual([mockComment]);
            expect(prismaService.comment.findMany).toHaveBeenCalled();
        });
    });

    describe('GET /comments/project/:projectId', () => {
        it('should return comments for a project', async () => {
            const response = await request(app.getHttpServer())
                .get('/comments/project/project-1')
                .expect(200);

            expect(response.body).toEqual([mockComment]);
        });

        it('should return 400 for invalid UUID', async () => {
            await request(app.getHttpServer())
                .get('/comments/project/invalid-uuid')
                .expect(400);
        });
    });

    describe('GET /comments/post/:postId', () => {
        it('should return comments for a post', async () => {
            const response = await request(app.getHttpServer())
                .get('/comments/post/post-1')
                .expect(200);

            expect(response.body).toEqual([mockComment]);
        });
    });

    describe('GET /comments/project/:projectId/stats', () => {
        it('should return comment statistics for a project', async () => {
            const stats = {
                totalComments: 10,
                topLevelComments: 7,
                replies: 3
            };

            // Mock count calls for stats
            prismaService.comment.count = jest
                .fn()
                .mockResolvedValueOnce(10) // total
                .mockResolvedValueOnce(7); // top level

            const response = await request(app.getHttpServer())
                .get('/comments/project/project-1/stats')
                .expect(200);

            expect(response.body).toEqual(stats);
        });
    });

    describe('GET /comments/search', () => {
        it('should search comments by keyword', async () => {
            const response = await request(app.getHttpServer())
                .get('/comments/search?keyword=test')
                .expect(200);

            expect(response.body).toEqual([mockComment]);
        });
    });

    describe('PATCH /comments/:id', () => {
        it('should update a comment', async () => {
            const updateDto = {
                content: 'Updated comment content'
            };

            const updatedComment = {
                ...mockComment,
                content: 'Updated comment content'
            };
            prismaService.comment.update = jest
                .fn()
                .mockResolvedValue(updatedComment);

            const response = await request(app.getHttpServer())
                .patch('/comments/comment-1')
                .send(updateDto)
                .expect(200);

            expect(response.body).toEqual(updatedComment);
        });

        it('should return 400 for invalid data', async () => {
            const invalidDto = {
                content: '' // Invalid empty content
            };

            await request(app.getHttpServer())
                .patch('/comments/comment-1')
                .send(invalidDto)
                .expect(400);
        });
    });

    describe('DELETE /comments/:id', () => {
        it('should delete a comment', async () => {
            const response = await request(app.getHttpServer())
                .delete('/comments/comment-1')
                .expect(200);

            expect(response.body).toEqual(mockComment);
            expect(prismaService.comment.delete).toHaveBeenCalledWith({
                where: { id: 'comment-1' }
            });
        });
    });
});
