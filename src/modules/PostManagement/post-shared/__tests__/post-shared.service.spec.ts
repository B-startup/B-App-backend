import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostSharedService } from '../post-shared.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreatePostSharedDto } from '../dto/create-post-shared.dto';
import { UpdatePostSharedDto } from '../dto/update-post-shared.dto';
import { PostShared } from '@prisma/client';

describe('PostSharedService', () => {
    let service: PostSharedService;

    const mockPostShared: PostShared = {
        id: 'test-share-id',
        postId: 'test-post-id',
        userId: 'test-user-id',
        description: 'Check out this amazing post!',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockPost = {
        id: 'test-post-id',
        title: 'Test Post',
        content: 'Test content',
        nbShares: 5
    };

    const mockUser = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com'
    };

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
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostSharedService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<PostSharedService>(PostSharedService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sharePost', () => {
        const createPostSharedDto: CreatePostSharedDto = {
            postId: 'test-post-id',
            userId: 'test-user-id',
            description: 'Check out this amazing post!'
        };

        it('should successfully share a post', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.postShared.create.mockResolvedValue(
                mockPostShared
            );
            mockPrismaService.post.update.mockResolvedValue({
                ...mockPost,
                nbShares: mockPost.nbShares + 1
            });

            const result = await service.sharePost(createPostSharedDto);

            expect(result).toEqual(mockPostShared);
            expect(mockPrismaService.postShared.findFirst).toHaveBeenCalledWith(
                {
                    where: {
                        userId: createPostSharedDto.userId,
                        postId: createPostSharedDto.postId
                    }
                }
            );
            expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                where: { id: createPostSharedDto.postId },
                data: { nbShares: { increment: 1 } }
            });
        });

        it('should throw ConflictException if user already shared the post', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(
                mockPostShared
            );

            await expect(
                service.sharePost(createPostSharedDto)
            ).rejects.toThrow(ConflictException);
            expect(mockPrismaService.postShared.findFirst).toHaveBeenCalledWith(
                {
                    where: {
                        userId: createPostSharedDto.userId,
                        postId: createPostSharedDto.postId
                    }
                }
            );
        });

        it('should throw NotFoundException if post does not exist', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);
            mockPrismaService.post.findUnique.mockResolvedValue(null);

            await expect(
                service.sharePost(createPostSharedDto)
            ).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: createPostSharedDto.postId }
            });
        });

        it('should throw NotFoundException if user does not exist', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                service.sharePost(createPostSharedDto)
            ).rejects.toThrow(NotFoundException);
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: createPostSharedDto.userId }
            });
        });
    });

    describe('unsharePost', () => {
        it('should successfully unshare a post', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(
                mockPostShared
            );
            mockPrismaService.postShared.delete.mockResolvedValue(
                mockPostShared
            );
            mockPrismaService.post.update.mockResolvedValue({
                ...mockPost,
                nbShares: mockPost.nbShares - 1
            });

            const result = await service.unsharePost(
                'test-user-id',
                'test-post-id'
            );

            expect(result).toEqual(mockPostShared);
            expect(mockPrismaService.postShared.findFirst).toHaveBeenCalledWith(
                {
                    where: {
                        userId: 'test-user-id',
                        postId: 'test-post-id'
                    }
                }
            );
            expect(mockPrismaService.post.update).toHaveBeenCalledWith({
                where: { id: 'test-post-id' },
                data: { nbShares: { decrement: 1 } }
            });
        });

        it('should throw NotFoundException if share does not exist', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);

            await expect(
                service.unsharePost('test-user-id', 'test-post-id')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('hasUserSharedPost', () => {
        it('should return true if user has shared the post', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(
                mockPostShared
            );

            const result = await service.hasUserSharedPost(
                'test-user-id',
                'test-post-id'
            );

            expect(result).toBe(true);
        });

        it('should return false if user has not shared the post', async () => {
            mockPrismaService.postShared.findFirst.mockResolvedValue(null);

            const result = await service.hasUserSharedPost(
                'test-user-id',
                'test-post-id'
            );

            expect(result).toBe(false);
        });
    });

    describe('findByPost', () => {
        it('should return all shares for a post', async () => {
            const shares = [mockPostShared];
            mockPrismaService.postShared.findMany.mockResolvedValue(shares);

            const result = await service.findByPost('test-post-id');

            expect(result).toEqual(shares);
            expect(mockPrismaService.postShared.findMany).toHaveBeenCalledWith({
                where: { postId: 'test-post-id' },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findByPostWithUsers', () => {
        it('should return shares with user information', async () => {
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
            mockPrismaService.postShared.findMany.mockResolvedValue(
                sharesWithUsers
            );

            const result = await service.findByPostWithUsers('test-post-id');

            expect(result).toEqual(sharesWithUsers);
            expect(mockPrismaService.postShared.findMany).toHaveBeenCalledWith({
                where: { postId: 'test-post-id' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            profilePicture: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('findUserSharesWithPosts', () => {
        it('should return user shares with post details', async () => {
            const sharesWithPosts = [
                {
                    ...mockPostShared,
                    post: {
                        id: 'test-post-id',
                        title: 'Test Post',
                        content: 'Test content',
                        createdAt: new Date(),
                        user: {
                            id: 'post-creator-id',
                            name: 'Post Creator',
                            profilePicture: null
                        }
                    }
                }
            ];
            mockPrismaService.postShared.findMany.mockResolvedValue(
                sharesWithPosts
            );

            const result =
                await service.findUserSharesWithPosts('test-user-id');

            expect(result).toEqual(sharesWithPosts);
            expect(mockPrismaService.postShared.findMany).toHaveBeenCalledWith({
                where: { userId: 'test-user-id' },
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                            content: true,
                            createdAt: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    profilePicture: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        });
    });

    describe('countSharesByPost', () => {
        it('should return the count of shares for a post', async () => {
            mockPrismaService.postShared.count.mockResolvedValue(5);

            const result = await service.countSharesByPost('test-post-id');

            expect(result).toBe(5);
            expect(mockPrismaService.postShared.count).toHaveBeenCalledWith({
                where: { postId: 'test-post-id' }
            });
        });
    });

    describe('countSharesByUser', () => {
        it('should return the count of posts shared by a user', async () => {
            mockPrismaService.postShared.count.mockResolvedValue(3);

            const result = await service.countSharesByUser('test-user-id');

            expect(result).toBe(3);
            expect(mockPrismaService.postShared.count).toHaveBeenCalledWith({
                where: { userId: 'test-user-id' }
            });
        });
    });

    describe('inherited CRUD methods', () => {
        it('should create a post share', async () => {
            const createDto: CreatePostSharedDto = {
                postId: 'test-post-id',
                userId: 'test-user-id',
                description: 'Test description'
            };
            mockPrismaService.postShared.create.mockResolvedValue(
                mockPostShared
            );

            const result = await service.create(createDto);

            expect(result).toEqual(mockPostShared);
            expect(mockPrismaService.postShared.create).toHaveBeenCalledWith({
                data: createDto
            });
        });

        it('should find all post shares', async () => {
            const shares = [mockPostShared];
            mockPrismaService.postShared.findMany.mockResolvedValue(shares);

            const result = await service.findAll();

            expect(result).toEqual(shares);
            expect(mockPrismaService.postShared.findMany).toHaveBeenCalled();
        });

        it('should find shares by user', async () => {
            const userShares = [mockPostShared];
            mockPrismaService.postShared.findMany.mockResolvedValue(userShares);

            const result = await service.findByUser('test-user-id');

            expect(result).toEqual(userShares);
            expect(mockPrismaService.postShared.findMany).toHaveBeenCalledWith({
                where: { userId: 'test-user-id' },
                orderBy: { createdAt: 'desc' }
            });
        });

        it('should find one post share', async () => {
            mockPrismaService.postShared.findUnique.mockResolvedValue(
                mockPostShared
            );

            const result = await service.findOne('test-share-id');

            expect(result).toEqual(mockPostShared);
            expect(
                mockPrismaService.postShared.findUnique
            ).toHaveBeenCalledWith({
                where: { id: 'test-share-id' }
            });
        });

        it('should update a post share', async () => {
            const updateDto: UpdatePostSharedDto = {
                description: 'Updated description'
            };
            const updatedShare = { ...mockPostShared, ...updateDto };
            mockPrismaService.postShared.update.mockResolvedValue(updatedShare);

            const result = await service.update('test-share-id', updateDto);

            expect(result).toEqual(updatedShare);
            expect(mockPrismaService.postShared.update).toHaveBeenCalledWith({
                where: { id: 'test-share-id' },
                data: updateDto
            });
        });

        it('should remove a post share', async () => {
            mockPrismaService.postShared.delete.mockResolvedValue(
                mockPostShared
            );

            const result = await service.remove('test-share-id');

            expect(result).toEqual(mockPostShared);
            expect(mockPrismaService.postShared.delete).toHaveBeenCalledWith({
                where: { id: 'test-share-id' }
            });
        });
    });
});
