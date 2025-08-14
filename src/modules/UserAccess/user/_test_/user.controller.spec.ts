import { Test, TestingModule } from '@nestjs/testing';
import {  JwtService } from '@nestjs/jwt';
import {  ConfigService } from '@nestjs/config';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { TokenBlacklistService } from '../../../../core/services/token-blacklist.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto';

describe('UserController', () => {
    let controller: UserController;

    const mockUserResponseDto: UserResponseDto = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        description: null,
        country: null,
        city: null,
        birthdate: null,
        phone: null,
        profilePicture: null,
        webSite: null,
        CIN: null,
        passport: null,
        score: 0,
        role: 'User' as any,
        isEmailVerified: false,
        isCompleteProfile: false,
        isPhoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const mockUserService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        createWithProfileImage: jest.fn(),
        updateWithProfileImage: jest.fn(),
        uploadProfileImage: jest.fn(),
        removeProfileImage: jest.fn(),
        findUsers: jest.fn(),
        findByEmail: jest.fn(),
        updateProfile: jest.fn(),
        markProfileAsComplete: jest.fn(),
        getUserStats: jest.fn()
    };

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
        decode: jest.fn()
    };

    const mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret')
    };

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    };

    const mockTokenBlacklistService = {
        isBlacklisted: jest.fn().mockReturnValue(false),
        addToBlacklist: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                },
                {
                    provide: TokenBlacklistService,
                    useValue: mockTokenBlacklistService
                }
            ]
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'StrongPass123!'
            };

            mockUserService.create.mockResolvedValue(mockUserResponseDto);

            const result = await controller.create(createUserDto);

            expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
            expect(result).toEqual(mockUserResponseDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [mockUserResponseDto];
            mockUserService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(mockUserService.findAll).toHaveBeenCalled();
            expect(result).toEqual(users);
        });
    });

    describe('findOne', () => {
        it('should return a single user', async () => {
            mockUserService.findOne.mockResolvedValue(mockUserResponseDto);

            const result = await controller.findOne('test-id');

            expect(mockUserService.findOne).toHaveBeenCalledWith('test-id');
            expect(result).toEqual(mockUserResponseDto);
        });
    });

    describe('update', () => {
        it('should update a user', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated User'
            };
            const updatedUser = { ...mockUserResponseDto, name: 'Updated User' };
            
            mockUserService.update.mockResolvedValue(updatedUser);

            const result = await controller.update('test-id', updateUserDto);

            expect(mockUserService.update).toHaveBeenCalledWith('test-id', updateUserDto);
            expect(result.name).toBe('Updated User');
        });
    });

    describe('remove', () => {
        it('should remove a user', async () => {
            mockUserService.remove.mockResolvedValue(mockUserResponseDto);

            const result = await controller.remove('test-id');

            expect(mockUserService.remove).toHaveBeenCalledWith('test-id');
            expect(result).toEqual(mockUserResponseDto);
        });
    });

    describe('uploadProfileImage', () => {
        it('should upload profile image', async () => {
            const mockFile = {
                fieldname: 'profileImage',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                buffer: Buffer.from('test'),
                size: 1000
            } as Express.Multer.File;

            mockUserService.uploadProfileImage.mockResolvedValue({
                ...mockUserResponseDto,
                profilePicture: 'profile-images/test.jpg'
            });

            const result = await controller.uploadProfileImage('test-id', mockFile);

            expect(mockUserService.uploadProfileImage).toHaveBeenCalledWith('test-id', mockFile);
            expect(result.profilePicture).toBe('profile-images/test.jpg');
        });
    });

    describe('searchUsers', () => {
        it('should search users with filters', async () => {
            const mockSearchResult = {
                users: [mockUserResponseDto],
                total: 1,
                page: 1,
                limit: 10
            };

            mockUserService.findUsers.mockResolvedValue(mockSearchResult);

            const result = await controller.searchUsers('Test', 'Tunisia', 'Tunis', 'User', true, 1, 10);

            expect(mockUserService.findUsers).toHaveBeenCalledWith({
                search: 'Test',
                country: 'Tunisia',
                city: 'Tunis',
                role: 'User',
                isEmailVerified: true,
                page: 1,
                limit: 10
            });
            expect(result).toEqual(mockSearchResult);
        });
    });

    describe('getUserStats', () => {
        it('should return user statistics', async () => {
            const mockStats = {
                total: 100,
                verified: 80,
                unverified: 20,
                completeProfiles: 60,
                incompleteProfiles: 40,
                byRole: { User: 95, ADMIN: 5 },
                byCountry: { Tunisia: 70, France: 30 }
            };

            mockUserService.getUserStats.mockResolvedValue(mockStats);

            const result = await controller.getUserStats();

            expect(mockUserService.getUserStats).toHaveBeenCalled();
            expect(result).toEqual(mockStats);
        });
    });
});
