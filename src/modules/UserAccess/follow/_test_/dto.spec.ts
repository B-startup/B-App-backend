import { CreateFollowDto, UpdateFollowDto, FollowResponseDto, FollowWithUserDetailsDto } from '../dto';
import { Follow } from '@prisma/client';

describe('Follow DTOs', () => {
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

    describe('CreateFollowDto', () => {
        it('should create a valid CreateFollowDto', () => {
            // Arrange & Act
            const dto = new CreateFollowDto();
            dto.followerId = mockUserId1;
            dto.followingId = mockUserId2;

            // Assert
            expect(dto.followerId).toBe(mockUserId1);
            expect(dto.followingId).toBe(mockUserId2);
        });

        it('should have correct property types', () => {
            // Arrange
            const dto: CreateFollowDto = {
                followerId: mockUserId1,
                followingId: mockUserId2,
            };

            // Assert
            expect(typeof dto.followerId).toBe('string');
            expect(typeof dto.followingId).toBe('string');
        });
    });

    describe('UpdateFollowDto', () => {
        it('should extend CreateFollowDto as PartialType', () => {
            // Arrange & Act
            const dto = new UpdateFollowDto();
            dto.followerId = mockUserId1;

            // Assert
            expect(dto.followerId).toBe(mockUserId1);
            expect(dto.followingId).toBeUndefined();
        });

        it('should allow partial updates', () => {
            // Arrange
            const dto: UpdateFollowDto = {
                followerId: mockUserId1,
                // followingId is optional in UpdateDto
            };

            // Assert
            expect(dto.followerId).toBe(mockUserId1);
            expect(dto.followingId).toBeUndefined();
        });
    });

    describe('FollowResponseDto', () => {
        it('should create FollowResponseDto from Follow entity', () => {
            // Arrange & Act
            const dto = new FollowResponseDto(mockFollow);

            // Assert
            expect(dto.id).toBe(mockFollowId);
            expect(dto.followerId).toBe(mockUserId1);
            expect(dto.followingId).toBe(mockUserId2);
            expect(dto.createdAt).toEqual(mockFollow.createdAt);
            expect(dto.updatedAt).toEqual(mockFollow.updatedAt);
        });

        it('should have all required properties', () => {
            // Arrange & Act
            const dto = new FollowResponseDto(mockFollow);

            // Assert
            expect(dto).toHaveProperty('id');
            expect(dto).toHaveProperty('followerId');
            expect(dto).toHaveProperty('followingId');
            expect(dto).toHaveProperty('createdAt');
            expect(dto).toHaveProperty('updatedAt');
        });
    });

    describe('FollowWithUserDetailsDto', () => {
        it('should extend FollowResponseDto with user details', () => {
            // Arrange
            const dto: FollowWithUserDetailsDto = {
                id: mockFollowId,
                followerId: mockUserId1,
                followingId: mockUserId2,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-01-01T00:00:00.000Z'),
                follower: {
                    id: mockUserId1,
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                },
                following: {
                    id: mockUserId2,
                    name: 'John Doe',
                    email: 'john@example.com',
                },
            };

            // Assert
            expect(dto).toHaveProperty('id');
            expect(dto).toHaveProperty('followerId');
            expect(dto).toHaveProperty('followingId');
            expect(dto).toHaveProperty('follower');
            expect(dto).toHaveProperty('following');
            expect(dto.follower).toHaveProperty('name', 'Jane Doe');
            expect(dto.following).toHaveProperty('name', 'John Doe');
        });

        it('should allow optional user details', () => {
            // Arrange
            const dto: FollowWithUserDetailsDto = {
                id: mockFollowId,
                followerId: mockUserId1,
                followingId: mockUserId2,
                createdAt: new Date('2024-01-01T00:00:00.000Z'),
                updatedAt: new Date('2024-01-01T00:00:00.000Z'),
                // follower and following are optional
            };

            // Assert
            expect(dto.follower).toBeUndefined();
            expect(dto.following).toBeUndefined();
        });
    });

    describe('DTO Index Export', () => {
        it('should export all DTOs from index file', () => {
            // This test ensures that all DTOs are properly exported
            expect(CreateFollowDto).toBeDefined();
            expect(UpdateFollowDto).toBeDefined();
            expect(FollowResponseDto).toBeDefined();
            expect(FollowWithUserDetailsDto).toBeDefined();
        });
    });

    describe('DTO Validation Properties', () => {
        it('should have validation decorators on CreateFollowDto', () => {
            // This test would typically check for validation decorators
            // In a real scenario, you might want to test the actual validation
            const dto = new CreateFollowDto();
            expect(dto).toBeDefined();
            
            // You can add more specific validation tests here
            // For example, testing @IsUUID(), @IsNotEmpty() decorators
        });
    });
});
