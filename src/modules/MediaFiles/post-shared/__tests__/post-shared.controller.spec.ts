import { Test, TestingModule } from '@nestjs/testing';
import { PostSharedController } from '../post-shared.controller';
import { PostSharedService } from '../post-shared.service';
import { CreatePostSharedDto } from '../dto/create-post-shared.dto';
import { UpdatePostSharedDto } from '../dto/update-post-shared.dto';
import { PostShared } from '@prisma/client';

describe('PostSharedController', () => {
    let controller: PostSharedController;

    const mockPostShared: PostShared = {
        id: 'test-share-id',
        postId: 'test-post-id',
        userId: 'test-user-id',
        description: 'Check out this amazing post!',
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockPostSharedService = {
        sharePost: jest.fn(),
        findAll: jest.fn(),
        findByPost: jest.fn(),
        findByPostWithUsers: jest.fn(),
        findByUser: jest.fn(),
        findUserSharesWithPosts: jest.fn(),
        countSharesByPost: jest.fn(),
        countSharesByUser: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        unsharePost: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PostSharedController],
            providers: [
                {
                    provide: PostSharedService,
                    useValue: mockPostSharedService
                }
            ]
        }).compile();

        controller = module.get<PostSharedController>(PostSharedController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should share a post', async () => {
            const createPostSharedDto: CreatePostSharedDto = {
                postId: 'test-post-id',
                userId: 'test-user-id',
                description: 'Check out this amazing post!'
            };

            mockPostSharedService.sharePost.mockResolvedValue(mockPostShared);

            const result = await controller.create(createPostSharedDto);

            expect(result).toEqual(mockPostShared);
            expect(mockPostSharedService.sharePost).toHaveBeenCalledWith(createPostSharedDto);
        });
    });

    describe('findAll', () => {
        it('should return all post shares', async () => {
            const shares = [mockPostShared];
            mockPostSharedService.findAll.mockResolvedValue(shares);

            const result = await controller.findAll();

            expect(result).toEqual(shares);
            expect(mockPostSharedService.findAll).toHaveBeenCalled();
        });
    });

    describe('findByPost', () => {
        it('should return shares for a specific post without users', async () => {
            const shares = [mockPostShared];
            mockPostSharedService.findByPost.mockResolvedValue(shares);

            const result = await controller.findByPost('test-post-id', false);

            expect(result).toEqual(shares);
            expect(mockPostSharedService.findByPost).toHaveBeenCalledWith('test-post-id');
            expect(mockPostSharedService.findByPostWithUsers).not.toHaveBeenCalled();
        });

        it('should return shares for a specific post with users', async () => {
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
            mockPostSharedService.findByPostWithUsers.mockResolvedValue(sharesWithUsers);

            const result = await controller.findByPost('test-post-id', true);

            expect(result).toEqual(sharesWithUsers);
            expect(mockPostSharedService.findByPostWithUsers).toHaveBeenCalledWith('test-post-id');
            expect(mockPostSharedService.findByPost).not.toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return user shares without posts', async () => {
            const userShares = [mockPostShared];
            mockPostSharedService.findByUser.mockResolvedValue(userShares);

            const result = await controller.findByUser('test-user-id', false);

            expect(result).toEqual(userShares);
            expect(mockPostSharedService.findByUser).toHaveBeenCalledWith('test-user-id');
            expect(mockPostSharedService.findUserSharesWithPosts).not.toHaveBeenCalled();
        });

        it('should return user shares with posts', async () => {
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
            mockPostSharedService.findUserSharesWithPosts.mockResolvedValue(sharesWithPosts);

            const result = await controller.findByUser('test-user-id', true);

            expect(result).toEqual(sharesWithPosts);
            expect(mockPostSharedService.findUserSharesWithPosts).toHaveBeenCalledWith('test-user-id');
            expect(mockPostSharedService.findByUser).not.toHaveBeenCalled();
        });
    });

    describe('countByPost', () => {
        it('should return share count for a post', async () => {
            mockPostSharedService.countSharesByPost.mockResolvedValue(5);

            const result = await controller.countByPost('test-post-id');

            expect(result).toEqual({ count: 5 });
            expect(mockPostSharedService.countSharesByPost).toHaveBeenCalledWith('test-post-id');
        });
    });

    describe('countByUser', () => {
        it('should return share count for a user', async () => {
            mockPostSharedService.countSharesByUser.mockResolvedValue(3);

            const result = await controller.countByUser('test-user-id');

            expect(result).toEqual({ count: 3 });
            expect(mockPostSharedService.countSharesByUser).toHaveBeenCalledWith('test-user-id');
        });
    });

    describe('findOne', () => {
        it('should return a specific post share', async () => {
            mockPostSharedService.findOne.mockResolvedValue(mockPostShared);

            const result = await controller.findOne('test-share-id');

            expect(result).toEqual(mockPostShared);
            expect(mockPostSharedService.findOne).toHaveBeenCalledWith('test-share-id');
        });
    });

    describe('update', () => {
        it('should update a post share', async () => {
            const updatePostSharedDto: UpdatePostSharedDto = {
                description: 'Updated description'
            };
            const updatedShare = { ...mockPostShared, ...updatePostSharedDto };
            mockPostSharedService.update.mockResolvedValue(updatedShare);

            const result = await controller.update('test-share-id', updatePostSharedDto);

            expect(result).toEqual(updatedShare);
            expect(mockPostSharedService.update).toHaveBeenCalledWith('test-share-id', updatePostSharedDto);
        });
    });

    describe('remove', () => {
        it('should delete a post share', async () => {
            mockPostSharedService.remove.mockResolvedValue(mockPostShared);

            const result = await controller.remove('test-share-id');

            expect(result).toEqual(mockPostShared);
            expect(mockPostSharedService.remove).toHaveBeenCalledWith('test-share-id');
        });
    });

    describe('unshare', () => {
        it('should unshare a post', async () => {
            mockPostSharedService.unsharePost.mockResolvedValue(mockPostShared);

            const result = await controller.unshare('test-user-id', 'test-post-id');

            expect(result).toEqual(mockPostShared);
            expect(mockPostSharedService.unsharePost).toHaveBeenCalledWith('test-user-id', 'test-post-id');
        });
    });
});
