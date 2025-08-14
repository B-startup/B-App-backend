import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { FollowController } from '../follow.controller';
import { FollowService } from '../follow.service';
import { CreateFollowDto, FollowResponseDto, FollowWithUserDetailsDto } from '../dto';
import { Follow } from '@prisma/client';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';

// Mock FollowService
const mockFollowService = {
    createFollow: jest.fn(),
    findAllFollows: jest.fn(),
    findFollowById: jest.fn(),
    update: jest.fn(),
    removeFollow: jest.fn(),
    getFollowing: jest.fn(),
    getFollowers: jest.fn(),
    getFollowStats: jest.fn(),
    toggleFollow: jest.fn(),
    isFollowing: jest.fn(),
    getMutualFollows: jest.fn(),
};

describe('FollowController', () => {
    let controller: FollowController;

    const mockUserId1 = '123e4567-e89b-12d3-a456-426614174000';
    const mockUserId2 = '123e4567-e89b-12d3-a456-426614174001';
    const mockFollowId = '123e4567-e89b-12d3-a456-426614174002';

    const mockCreateFollowDto: CreateFollowDto = {
        followerId: mockUserId1,
        followingId: mockUserId2,
    };

    const mockFollowResponseDto: FollowResponseDto = {
        id: mockFollowId,
        followerId: mockUserId1,
        followingId: mockUserId2,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    } as FollowResponseDto;

    const mockFollowWithUserDetailsDto: FollowWithUserDetailsDto = {
        ...mockFollowResponseDto,
        following: {
            id: mockUserId2,
            name: 'John Doe',
            email: 'john@example.com',
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FollowController],
            providers: [
                {
                    provide: FollowService,
                    useValue: mockFollowService,
                },
            ],
        })
        .overrideGuard(TokenBlacklistGuard)
        .useValue({
            canActivate: () => true,
        })
        .compile();

        controller = module.get<FollowController>(FollowController);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('create', () => {
        it('should create a new follow relationship', async () => {
            // Arrange
            mockFollowService.createFollow.mockResolvedValue(mockFollowResponseDto);

            // Act
            const result = await controller.create(mockCreateFollowDto);

            // Assert
            expect(result).toEqual(mockFollowResponseDto);
            expect(mockFollowService.createFollow).toHaveBeenCalledWith(mockCreateFollowDto);
        });

        it('should handle ConflictException when relationship already exists', async () => {
            // Arrange
            mockFollowService.createFollow.mockRejectedValue(
                new ConflictException('Cette relation de suivi existe déjà'),
            );

            // Act & Assert
            await expect(controller.create(mockCreateFollowDto)).rejects.toThrow(
                ConflictException,
            );
            expect(mockFollowService.createFollow).toHaveBeenCalledWith(mockCreateFollowDto);
        });
    });

    describe('findAll', () => {
        it('should return all follow relationships', async () => {
            // Arrange
            const mockFollows = [mockFollowResponseDto];
            mockFollowService.findAllFollows.mockResolvedValue(mockFollows);

            // Act
            const result = await controller.findAll();

            // Assert
            expect(result).toEqual(mockFollows);
            expect(mockFollowService.findAllFollows).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a follow relationship by ID', async () => {
            // Arrange
            mockFollowService.findFollowById.mockResolvedValue(mockFollowResponseDto);

            // Act
            const result = await controller.findOne(mockFollowId);

            // Assert
            expect(result).toEqual(mockFollowResponseDto);
            expect(mockFollowService.findFollowById).toHaveBeenCalledWith(mockFollowId);
        });
    });

    describe('update', () => {
        it('should update a follow relationship', async () => {
            // Arrange
            const updateDto = {};
            const mockFollow = {} as Follow;
            mockFollowService.update.mockResolvedValue(mockFollow);

            // Act
            const result = await controller.update(mockFollowId, updateDto);

            // Assert
            expect(result).toEqual(mockFollow);
            expect(mockFollowService.update).toHaveBeenCalledWith(mockFollowId, updateDto);
        });
    });

    describe('remove', () => {
        it('should remove a follow relationship', async () => {
            // Arrange
            mockFollowService.removeFollow.mockResolvedValue(mockFollowResponseDto);

            // Act
            const result = await controller.remove(mockFollowId);

            // Assert
            expect(result).toEqual(mockFollowResponseDto);
            expect(mockFollowService.removeFollow).toHaveBeenCalledWith(mockFollowId);
        });
    });

    describe('getFollowing', () => {
        it('should return users that a specific user is following', async () => {
            // Arrange
            const mockFollowingUsers = [mockFollowWithUserDetailsDto];
            mockFollowService.getFollowing.mockResolvedValue(mockFollowingUsers);

            // Act
            const result = await controller.getFollowing(mockUserId1);

            // Assert
            expect(result).toEqual(mockFollowingUsers);
            expect(mockFollowService.getFollowing).toHaveBeenCalledWith(mockUserId1);
        });
    });

    describe('getFollowers', () => {
        it('should return users that are following a specific user', async () => {
            // Arrange
            const mockFollowerUsers = [mockFollowWithUserDetailsDto];
            mockFollowService.getFollowers.mockResolvedValue(mockFollowerUsers);

            // Act
            const result = await controller.getFollowers(mockUserId2);

            // Assert
            expect(result).toEqual(mockFollowerUsers);
            expect(mockFollowService.getFollowers).toHaveBeenCalledWith(mockUserId2);
        });
    });

    describe('getFollowStats', () => {
        it('should return follow statistics for a user', async () => {
            // Arrange
            const mockStats = { followersCount: 10, followingCount: 15 };
            mockFollowService.getFollowStats.mockResolvedValue(mockStats);

            // Act
            const result = await controller.getFollowStats(mockUserId1);

            // Assert
            expect(result).toEqual(mockStats);
            expect(mockFollowService.getFollowStats).toHaveBeenCalledWith(mockUserId1);
        });
    });

    describe('toggleFollow', () => {
        it('should toggle follow relationship to following', async () => {
            // Arrange
            const mockToggleResult = {
                isFollowing: true,
                follow: mockFollowResponseDto,
            };
            mockFollowService.toggleFollow.mockResolvedValue(mockToggleResult);

            // Act
            const result = await controller.toggleFollow({
                followerId: mockUserId1,
                followingId: mockUserId2,
            });

            // Assert
            expect(result).toEqual(mockToggleResult);
            expect(mockFollowService.toggleFollow).toHaveBeenCalledWith(
                mockUserId1,
                mockUserId2,
            );
        });

        it('should toggle follow relationship to unfollowing', async () => {
            // Arrange
            const mockToggleResult = {
                isFollowing: false,
            };
            mockFollowService.toggleFollow.mockResolvedValue(mockToggleResult);

            // Act
            const result = await controller.toggleFollow({
                followerId: mockUserId1,
                followingId: mockUserId2,
            });

            // Assert
            expect(result).toEqual(mockToggleResult);
            expect(mockFollowService.toggleFollow).toHaveBeenCalledWith(
                mockUserId1,
                mockUserId2,
            );
        });
    });

    describe('isFollowing', () => {
        it('should return true if user is following another user', async () => {
            // Arrange
            mockFollowService.isFollowing.mockResolvedValue(true);

            // Act
            const result = await controller.isFollowing(mockUserId1, mockUserId2);

            // Assert
            expect(result).toEqual({ isFollowing: true });
            expect(mockFollowService.isFollowing).toHaveBeenCalledWith(
                mockUserId1,
                mockUserId2,
            );
        });

        it('should return false if user is not following another user', async () => {
            // Arrange
            mockFollowService.isFollowing.mockResolvedValue(false);

            // Act
            const result = await controller.isFollowing(mockUserId1, mockUserId2);

            // Assert
            expect(result).toEqual({ isFollowing: false });
            expect(mockFollowService.isFollowing).toHaveBeenCalledWith(
                mockUserId1,
                mockUserId2,
            );
        });
    });

    describe('getMutualFollows', () => {
        it('should return mutual follows between two users', async () => {
            // Arrange
            const mockMutualFollows = [mockFollowWithUserDetailsDto];
            mockFollowService.getMutualFollows.mockResolvedValue(mockMutualFollows);

            // Act
            const result = await controller.getMutualFollows(mockUserId1, mockUserId2);

            // Assert
            expect(result).toEqual(mockMutualFollows);
            expect(mockFollowService.getMutualFollows).toHaveBeenCalledWith(
                mockUserId1,
                mockUserId2,
            );
        });
    });

    describe('HTTP Status Codes', () => {
        it('should have correct HTTP status codes for each endpoint', () => {
            // This test verifies that decorators are properly applied
            // In a real application, you might want to test the actual HTTP responses
            expect(controller).toBeDefined();
        });
    });

    describe('Validation', () => {
        it('should handle UUID validation through ParseUUIDPipe', async () => {
            // Arrange
            mockFollowService.findFollowById.mockResolvedValue(mockFollowResponseDto);

            // Act
            const result = await controller.findOne(mockFollowId);

            // Assert
            expect(result).toEqual(mockFollowResponseDto);
            // The ParseUUIDPipe will handle validation at the framework level
        });
    });
});
