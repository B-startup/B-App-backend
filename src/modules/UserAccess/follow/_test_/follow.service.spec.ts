import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaClient, Follow, User } from '@prisma/client';
import { FollowService } from '../follow.service';
import { CreateFollowDto } from '../dto';

// Mock PrismaClient
const mockPrismaClient = {
    follow: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    user: {
        update: jest.fn(),
    },
    $transaction: jest.fn(),
};

describe('FollowService', () => {
    let service: FollowService;
    let prisma: jest.Mocked<PrismaClient>;

    const mockUserId1 = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserId2 = '123e4567-e89b-12d3-a456-426614174001';
    const mockFollowId = '123e4567-e89b-12d3-a456-426614174002';

    const mockFollow: Follow = {
        id: mockFollowId,
        followerId: mockUserId1,
        followingId: mockUserId2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    };

    const mockCreateFollowDto: CreateFollowDto = {
        followerId: mockUserId1,
        followingId: mockUserId2,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FollowService,
                {
                    provide: PrismaClient,
                    useValue: mockPrismaClient,
                },
            ],
        }).compile();

        service = module.get<FollowService>(FollowService);
        prisma = module.get(PrismaClient);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('create', () => {
        it('should create a follow relationship successfully', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(null);
            mockPrismaClient.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrismaClient);
            });
            mockPrismaClient.follow.create.mockResolvedValue(mockFollow);
            mockPrismaClient.user.update.mockResolvedValue({} as User);

            // Act
            const result = await service.create(mockCreateFollowDto);

            // Assert
            expect(result).toEqual(mockFollow);
            expect(mockPrismaClient.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: mockUserId1,
                        followingId: mockUserId2,
                    },
                },
            });
            expect(mockPrismaClient.follow.create).toHaveBeenCalledWith({
                data: mockCreateFollowDto,
            });
            expect(mockPrismaClient.user.update).toHaveBeenCalledTimes(2);
        });

        it('should throw ConflictException if user tries to follow themselves', async () => {
            // Arrange
            const selfFollowDto: CreateFollowDto = {
                followerId: mockUserId1,
                followingId: mockUserId1,
            };

            // Act & Assert
            await expect(service.create(selfFollowDto)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.create(selfFollowDto)).rejects.toThrow(
                'Un utilisateur ne peut pas se suivre lui-même',
            );
        });

        it('should throw ConflictException if follow relationship already exists', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(mockFollow);

            // Act & Assert
            await expect(service.create(mockCreateFollowDto)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.create(mockCreateFollowDto)).rejects.toThrow(
                'Cette relation de suivi existe déjà',
            );
        });
    });

    describe('remove', () => {
        it('should remove a follow relationship successfully', async () => {
            // Arrange
            mockPrismaClient.follow.findUniqueOrThrow.mockResolvedValue(mockFollow);
            mockPrismaClient.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrismaClient);
            });
            mockPrismaClient.follow.delete.mockResolvedValue(mockFollow);
            mockPrismaClient.user.update.mockResolvedValue({} as User);

            // Act
            const result = await service.remove(mockFollowId);

            // Assert
            expect(result).toEqual(mockFollow);
            expect(mockPrismaClient.follow.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: mockFollowId },
                select: { followerId: true, followingId: true },
            });
            expect(mockPrismaClient.follow.delete).toHaveBeenCalledWith({
                where: { id: mockFollowId },
            });
            expect(mockPrismaClient.user.update).toHaveBeenCalledTimes(2);
        });
    });

    describe('getFollowing', () => {
        it('should return users that a specific user is following', async () => {
            // Arrange
            const mockFollowsWithUsers = [
                {
                    ...mockFollow,
                    following: {
                        id: mockUserId2,
                        name: 'John Doe',
                        email: 'john@example.com',
                    },
                },
            ];
            mockPrismaClient.follow.findMany.mockResolvedValue(mockFollowsWithUsers);

            // Act
            const result = await service.getFollowing(mockUserId1);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('following');
            expect(mockPrismaClient.follow.findMany).toHaveBeenCalledWith({
                where: { followerId: mockUserId1 },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('getFollowers', () => {
        it('should return users that are following a specific user', async () => {
            // Arrange
            const mockFollowsWithUsers = [
                {
                    ...mockFollow,
                    follower: {
                        id: mockUserId1,
                        name: 'Jane Doe',
                        email: 'jane@example.com',
                    },
                },
            ];
            mockPrismaClient.follow.findMany.mockResolvedValue(mockFollowsWithUsers);

            // Act
            const result = await service.getFollowers(mockUserId2);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('follower');
            expect(mockPrismaClient.follow.findMany).toHaveBeenCalledWith({
                where: { followingId: mockUserId2 },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('isFollowing', () => {
        it('should return true if user is following another user', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(mockFollow);

            // Act
            const result = await service.isFollowing(mockUserId1, mockUserId2);

            // Assert
            expect(result).toBe(true);
            expect(mockPrismaClient.follow.findUnique).toHaveBeenCalledWith({
                where: {
                    followerId_followingId: {
                        followerId: mockUserId1,
                        followingId: mockUserId2,
                    },
                },
            });
        });

        it('should return false if user is not following another user', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(null);

            // Act
            const result = await service.isFollowing(mockUserId1, mockUserId2);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('toggleFollow', () => {
        it('should create follow relationship if not exists', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(null);
            mockPrismaClient.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrismaClient);
            });
            mockPrismaClient.follow.create.mockResolvedValue(mockFollow);
            mockPrismaClient.user.update.mockResolvedValue({} as User);

            // Act
            const result = await service.toggleFollow(mockUserId1, mockUserId2);

            // Assert
            expect(result.isFollowing).toBe(true);
            expect(result.follow).toBeDefined();
        });

        it('should remove follow relationship if exists', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(mockFollow);
            mockPrismaClient.follow.findUniqueOrThrow.mockResolvedValue(mockFollow);
            mockPrismaClient.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrismaClient);
            });
            mockPrismaClient.follow.delete.mockResolvedValue(mockFollow);
            mockPrismaClient.user.update.mockResolvedValue({} as User);

            // Act
            const result = await service.toggleFollow(mockUserId1, mockUserId2);

            // Assert
            expect(result.isFollowing).toBe(false);
            expect(result.follow).toBeUndefined();
        });
    });

    describe('getFollowStats', () => {
        it('should return correct follow statistics', async () => {
            // Arrange
            mockPrismaClient.follow.count
                .mockResolvedValueOnce(10) // followers count
                .mockResolvedValueOnce(15); // following count

            // Act
            const result = await service.getFollowStats(mockUserId1);

            // Assert
            expect(result).toEqual({
                followersCount: 10,
                followingCount: 15,
            });
            expect(mockPrismaClient.follow.count).toHaveBeenCalledTimes(2);
        });
    });

    describe('getMutualFollows', () => {
        it('should return mutual follows between two users', async () => {
            // Arrange
            const mockMutualFollows = [
                {
                    ...mockFollow,
                    following: {
                        id: 'mutual-user-id',
                        name: 'Mutual Friend',
                        email: 'mutual@example.com',
                    },
                },
            ];
            mockPrismaClient.follow.findMany
                .mockResolvedValueOnce([{ followingId: 'mutual-user-id' }] as any)
                .mockResolvedValueOnce(mockMutualFollows);

            // Act
            const result = await service.getMutualFollows(mockUserId1, mockUserId2);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('following');
        });
    });

    describe('createFollow (DTO method)', () => {
        it('should create follow and return FollowResponseDto', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(null);
            mockPrismaClient.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrismaClient);
            });
            mockPrismaClient.follow.create.mockResolvedValue(mockFollow);
            mockPrismaClient.user.update.mockResolvedValue({} as User);

            // Act
            const result = await service.createFollow(mockCreateFollowDto);

            // Assert
            expect(result).toHaveProperty('id', mockFollowId);
            expect(result).toHaveProperty('followerId', mockUserId1);
            expect(result).toHaveProperty('followingId', mockUserId2);
        });
    });

    describe('findAllFollows', () => {
        it('should return all follows as FollowResponseDto array', async () => {
            // Arrange
            mockPrismaClient.follow.findMany.mockResolvedValue([mockFollow]);

            // Act
            const result = await service.findAllFollows();

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty('id', mockFollowId);
        });
    });

    describe('findFollowById', () => {
        it('should return follow by ID as FollowResponseDto', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(mockFollow);

            // Act
            const result = await service.findFollowById(mockFollowId);

            // Assert
            expect(result).toHaveProperty('id', mockFollowId);
        });

        it('should throw NotFoundException if follow not found', async () => {
            // Arrange
            mockPrismaClient.follow.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.findFollowById(mockFollowId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('removeFollow', () => {
        it('should remove follow and return FollowResponseDto', async () => {
            // Arrange
            mockPrismaClient.follow.findUniqueOrThrow.mockResolvedValue(mockFollow);
            mockPrismaClient.$transaction.mockImplementation(async (callback) => {
                return await callback(mockPrismaClient);
            });
            mockPrismaClient.follow.delete.mockResolvedValue(mockFollow);
            mockPrismaClient.user.update.mockResolvedValue({} as User);

            // Act
            const result = await service.removeFollow(mockFollowId);

            // Assert
            expect(result).toHaveProperty('id', mockFollowId);
        });
    });
});
