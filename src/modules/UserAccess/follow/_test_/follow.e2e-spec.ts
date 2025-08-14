import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../../../app.module';
import { CreateFollowDto } from '../dto';

describe('Follow E2E', () => {
    let app: INestApplication;
    let prisma: PrismaClient;
    let jwtToken: string;

    // Test user IDs - en production, ceux-ci seraient créés dynamiquement
    const testUserId1 = '11111111-1111-1111-1111-111111111111';
    const testUserId2 = '22222222-2222-2222-2222-222222222222';
    const testUserId3 = '33333333-3333-3333-3333-333333333333';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }));

        await app.init();

        prisma = new PrismaClient();

        // Create test users in database
        await prisma.user.createMany({
            data: [
                {
                    id: testUserId1,
                    email: 'user1@test.com',
                    name: 'Test User 1',
                    password: 'hashedpassword1',
                },
                {
                    id: testUserId2,
                    email: 'user2@test.com',
                    name: 'Test User 2',
                    password: 'hashedpassword2',
                },
                {
                    id: testUserId3,
                    email: 'user3@test.com',
                    name: 'Test User 3',
                    password: 'hashedpassword3',
                },
            ],
            skipDuplicates: true,
        });

        // Get JWT token for authentication (mock implementation)
        jwtToken = 'Bearer mock-jwt-token';
    });

    afterAll(async () => {
        // Clean up test data
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: { in: [testUserId1, testUserId2, testUserId3] } },
                    { followingId: { in: [testUserId1, testUserId2, testUserId3] } },
                ],
            },
        });

        await prisma.user.deleteMany({
            where: {
                id: { in: [testUserId1, testUserId2, testUserId3] },
            },
        });

        await prisma.$disconnect();
        await app.close();
    });

    beforeEach(async () => {
        // Clean up follows before each test
        await prisma.follow.deleteMany({
            where: {
                OR: [
                    { followerId: { in: [testUserId1, testUserId2, testUserId3] } },
                    { followingId: { in: [testUserId1, testUserId2, testUserId3] } },
                ],
            },
        });
    });

    describe('/follow (POST)', () => {
        it('should create a new follow relationship', async () => {
            const createFollowDto: CreateFollowDto = {
                followerId: testUserId1,
                followingId: testUserId2,
            };

            return request(app.getHttpServer())
                .post('/follow')
                .set('Authorization', jwtToken)
                .send(createFollowDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.followerId).toBe(testUserId1);
                    expect(res.body.followingId).toBe(testUserId2);
                });
        });

        it('should return 409 when trying to follow yourself', async () => {
            const createFollowDto: CreateFollowDto = {
                followerId: testUserId1,
                followingId: testUserId1,
            };

            return request(app.getHttpServer())
                .post('/follow')
                .set('Authorization', jwtToken)
                .send(createFollowDto)
                .expect(409);
        });

        it('should return 409 when relationship already exists', async () => {
            // Create initial follow
            await prisma.follow.create({
                data: {
                    followerId: testUserId1,
                    followingId: testUserId2,
                },
            });

            const createFollowDto: CreateFollowDto = {
                followerId: testUserId1,
                followingId: testUserId2,
            };

            return request(app.getHttpServer())
                .post('/follow')
                .set('Authorization', jwtToken)
                .send(createFollowDto)
                .expect(409);
        });

        it('should return 400 for invalid UUID format', async () => {
            const createFollowDto = {
                followerId: 'invalid-uuid',
                followingId: testUserId2,
            };

            return request(app.getHttpServer())
                .post('/follow')
                .set('Authorization', jwtToken)
                .send(createFollowDto)
                .expect(400);
        });

        it('should return 401 without authorization token', async () => {
            const createFollowDto: CreateFollowDto = {
                followerId: testUserId1,
                followingId: testUserId2,
            };

            return request(app.getHttpServer())
                .post('/follow')
                .send(createFollowDto)
                .expect(401);
        });
    });

    describe('/follow (GET)', () => {
        beforeEach(async () => {
            // Create test follows
            await prisma.follow.createMany({
                data: [
                    { followerId: testUserId1, followingId: testUserId2 },
                    { followerId: testUserId2, followingId: testUserId3 },
                ],
            });
        });

        it('should return all follow relationships', async () => {
            return request(app.getHttpServer())
                .get('/follow')
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body.length).toBeGreaterThanOrEqual(2);
                });
        });
    });

    describe('/follow/check (GET)', () => {
        beforeEach(async () => {
            await prisma.follow.create({
                data: {
                    followerId: testUserId1,
                    followingId: testUserId2,
                },
            });
        });

        it('should return true when follow relationship exists', async () => {
            return request(app.getHttpServer())
                .get(`/follow/check?followerId=${testUserId1}&followingId=${testUserId2}`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.isFollowing).toBe(true);
                });
        });

        it('should return false when follow relationship does not exist', async () => {
            return request(app.getHttpServer())
                .get(`/follow/check?followerId=${testUserId2}&followingId=${testUserId1}`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.isFollowing).toBe(false);
                });
        });

        it('should return 400 for missing parameters', async () => {
            return request(app.getHttpServer())
                .get('/follow/check?followerId=')
                .set('Authorization', jwtToken)
                .expect(400);
        });
    });

    describe('/follow/toggle (POST)', () => {
        it('should create follow relationship when none exists', async () => {
            const toggleDto = {
                followerId: testUserId1,
                followingId: testUserId2,
            };

            return request(app.getHttpServer())
                .post('/follow/toggle')
                .set('Authorization', jwtToken)
                .send(toggleDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.isFollowing).toBe(true);
                    expect(res.body.follow).toBeDefined();
                });
        });

        it('should remove follow relationship when it exists', async () => {
            // Create initial follow
            await prisma.follow.create({
                data: {
                    followerId: testUserId1,
                    followingId: testUserId2,
                },
            });

            const toggleDto = {
                followerId: testUserId1,
                followingId: testUserId2,
            };

            return request(app.getHttpServer())
                .post('/follow/toggle')
                .set('Authorization', jwtToken)
                .send(toggleDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.isFollowing).toBe(false);
                    expect(res.body.follow).toBeUndefined();
                });
        });
    });

    describe('/follow/:id (GET)', () => {
        let followId: string;

        beforeEach(async () => {
            const follow = await prisma.follow.create({
                data: {
                    followerId: testUserId1,
                    followingId: testUserId2,
                },
            });
            followId = follow.id;
        });

        it('should return follow relationship by ID', async () => {
            return request(app.getHttpServer())
                .get(`/follow/${followId}`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(followId);
                    expect(res.body.followerId).toBe(testUserId1);
                    expect(res.body.followingId).toBe(testUserId2);
                });
        });

        it('should return 404 for non-existent follow ID', async () => {
            const nonExistentId = '99999999-9999-9999-9999-999999999999';
            return request(app.getHttpServer())
                .get(`/follow/${nonExistentId}`)
                .set('Authorization', jwtToken)
                .expect(404);
        });

        it('should return 400 for invalid UUID', async () => {
            return request(app.getHttpServer())
                .get('/follow/invalid-uuid')
                .set('Authorization', jwtToken)
                .expect(400);
        });
    });

    describe('/follow/:id (DELETE)', () => {
        let followId: string;

        beforeEach(async () => {
            const follow = await prisma.follow.create({
                data: {
                    followerId: testUserId1,
                    followingId: testUserId2,
                },
            });
            followId = follow.id;
        });

        it('should delete follow relationship', async () => {
            return request(app.getHttpServer())
                .delete(`/follow/${followId}`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body.id).toBe(followId);
                });
        });
    });

    describe('/follow/user/:userId/following (GET)', () => {
        beforeEach(async () => {
            await prisma.follow.createMany({
                data: [
                    { followerId: testUserId1, followingId: testUserId2 },
                    { followerId: testUserId1, followingId: testUserId3 },
                ],
            });
        });

        it('should return users that a specific user is following', async () => {
            return request(app.getHttpServer())
                .get(`/follow/user/${testUserId1}/following`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body).toHaveLength(2);
                    expect(res.body[0]).toHaveProperty('following');
                });
        });
    });

    describe('/follow/user/:userId/followers (GET)', () => {
        beforeEach(async () => {
            await prisma.follow.createMany({
                data: [
                    { followerId: testUserId1, followingId: testUserId3 },
                    { followerId: testUserId2, followingId: testUserId3 },
                ],
            });
        });

        it('should return users that are following a specific user', async () => {
            return request(app.getHttpServer())
                .get(`/follow/user/${testUserId3}/followers`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body).toHaveLength(2);
                    expect(res.body[0]).toHaveProperty('follower');
                });
        });
    });

    describe('/follow/user/:userId/stats (GET)', () => {
        beforeEach(async () => {
            await prisma.follow.createMany({
                data: [
                    { followerId: testUserId1, followingId: testUserId2 }, // user1 follows user2
                    { followerId: testUserId1, followingId: testUserId3 }, // user1 follows user3
                    { followerId: testUserId2, followingId: testUserId1 }, // user2 follows user1
                ],
            });
        });

        it('should return follow statistics for a user', async () => {
            return request(app.getHttpServer())
                .get(`/follow/user/${testUserId1}/stats`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('followersCount', 1); // user2 follows user1
                    expect(res.body).toHaveProperty('followingCount', 2); // user1 follows user2 and user3
                });
        });
    });

    describe('/follow/mutual/:userId1/:userId2 (GET)', () => {
        beforeEach(async () => {
            await prisma.follow.createMany({
                data: [
                    { followerId: testUserId1, followingId: testUserId3 }, // user1 follows user3
                    { followerId: testUserId2, followingId: testUserId3 }, // user2 follows user3 (mutual)
                ],
            });
        });

        it('should return mutual follows between two users', async () => {
            return request(app.getHttpServer())
                .get(`/follow/mutual/${testUserId1}/${testUserId2}`)
                .set('Authorization', jwtToken)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeInstanceOf(Array);
                    // Should return user3 as mutual follow
                    if (res.body.length > 0) {
                        expect(res.body[0]).toHaveProperty('following');
                        expect(res.body[0].followingId).toBe(testUserId3);
                    }
                });
        });
    });

    describe('Counter Auto-increment Integration', () => {
        it('should increment nbFollowing for follower and nbFollowers for followed user', async () => {
            // Get initial counts
            const initialUser1 = await prisma.user.findUnique({
                where: { id: testUserId1 },
                select: { nbFollowing: true },
            });
            const initialUser2 = await prisma.user.findUnique({
                where: { id: testUserId2 },
                select: { nbFollowers: true },
            });

            // Create follow relationship
            const createFollowDto: CreateFollowDto = {
                followerId: testUserId1,
                followingId: testUserId2,
            };

            await request(app.getHttpServer())
                .post('/follow')
                .set('Authorization', jwtToken)
                .send(createFollowDto)
                .expect(201);

            // Verify counters were incremented
            const updatedUser1 = await prisma.user.findUnique({
                where: { id: testUserId1 },
                select: { nbFollowing: true },
            });
            const updatedUser2 = await prisma.user.findUnique({
                where: { id: testUserId2 },
                select: { nbFollowers: true },
            });

            expect(updatedUser1.nbFollowing).toBe((initialUser1?.nbFollowing ?? 0) + 1);
            expect(updatedUser2.nbFollowers).toBe((initialUser2?.nbFollowers ?? 0) + 1);
        });

        it('should decrement counters when follow is removed', async () => {
            // Create follow first
            const follow = await prisma.follow.create({
                data: {
                    followerId: testUserId1,
                    followingId: testUserId2,
                },
            });

            // Get counts after creation
            const beforeUser1 = await prisma.user.findUnique({
                where: { id: testUserId1 },
                select: { nbFollowing: true },
            });
            const beforeUser2 = await prisma.user.findUnique({
                where: { id: testUserId2 },
                select: { nbFollowers: true },
            });

            // Remove follow
            await request(app.getHttpServer())
                .delete(`/follow/${follow.id}`)
                .set('Authorization', jwtToken)
                .expect(200);

            // Verify counters were decremented
            const afterUser1 = await prisma.user.findUnique({
                where: { id: testUserId1 },
                select: { nbFollowing: true },
            });
            const afterUser2 = await prisma.user.findUnique({
                where: { id: testUserId2 },
                select: { nbFollowers: true },
            });

            expect(afterUser1.nbFollowing).toBe((beforeUser1?.nbFollowing ?? 0) - 1);
            expect(afterUser2.nbFollowers).toBe((beforeUser2?.nbFollowers ?? 0) - 1);
        });
    });
});
