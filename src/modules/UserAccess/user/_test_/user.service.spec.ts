import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';

// Mock des dépendances
jest.mock('bcryptjs');
jest.mock('fs');

describe('UserService', () => {
    let service: UserService;
    let prismaService: PrismaService;
    let configService: ConfigService;

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        }
    };

    const mockConfigService = {
        get: jest.fn((key: string, defaultValue: any) => {
            const config = {
                'PROFILE_IMAGES_DIR': 'uploads/profile-images',
                'PROFILE_IMAGES_MAX_SIZE': '2097152'
            };
            return config[key] || defaultValue;
        })
    };

    const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        role: 'User',
        isEmailVerified: false,
        isCompleteProfile: false,
        isPhoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        otpCode: '123456',
        otpCodeExpiresAt: new Date(),
        refreshToken: null,
        description: null,
        country: null,
        city: null,
        birthdate: null,
        phone: null,
        profilePicture: null,
        webSite: null,
        CIN: null,
        passport: null,
        score: 0
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService
                }
            ]
        }).compile();

        service = module.get<UserService>(UserService);
        prismaService = module.get<PrismaService>(PrismaService);
        configService = module.get<ConfigService>(ConfigService);

        // Mock fs
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a user successfully', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'StrongPass123!'
            };

            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue(mockUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

            const result = await service.create(createUserDto);

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: createUserDto.email }
            });
            expect(mockPrismaService.user.create).toHaveBeenCalled();
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role,
                isEmailVerified: mockUser.isEmailVerified,
                isCompleteProfile: mockUser.isCompleteProfile,
                isPhoneVerified: mockUser.isPhoneVerified,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
                description: mockUser.description,
                country: mockUser.country,
                city: mockUser.city,
                birthdate: mockUser.birthdate,
                phone: mockUser.phone,
                profilePicture: mockUser.profilePicture,
                webSite: mockUser.webSite,
                CIN: mockUser.CIN,
                passport: mockUser.passport,
                score: mockUser.score
            });
        });

        it('should throw ConflictException if email already exists', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                name: 'Test User',
                password: 'StrongPass123!'
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all users', async () => {
            const users = [mockUser];
            mockPrismaService.user.findMany.mockResolvedValue(users);

            const result = await service.findAll();

            expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toHaveLength(1);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findOne('test-id');

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-id' }
            });
            expect(result.id).toBe(mockUser.id);
        });

        it('should throw NotFoundException if user not found', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update a user successfully', async () => {
            const updateUserDto: UpdateUserDto = {
                name: 'Updated Name'
            };
            const updatedUser = { ...mockUser, name: 'Updated Name' };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(updatedUser);

            const result = await service.update('test-id', updateUserDto);

            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: 'test-id' },
                data: updateUserDto
            });
            expect(result.name).toBe('Updated Name');
        });
    });

    describe('remove', () => {
        it('should remove a user successfully', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.delete.mockResolvedValue(mockUser);

            const result = await service.remove('test-id');

            expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
                where: { id: 'test-id' }
            });
            expect(result.id).toBe(mockUser.id);
        });
    });

    describe('findByEmail', () => {
        it('should return a user by email', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.findByEmail('test@example.com');

            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' }
            });
            expect(result?.email).toBe(mockUser.email);
        });
    });

    describe('uploadProfileImage', () => {
        it('should upload profile image successfully', async () => {
            const mockFile: Express.Multer.File = {
                fieldname: 'profileImage',
                originalname: 'test.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1000,
                buffer: Buffer.from('test'),
                destination: '',
                filename: '',
                path: '',
                stream: null as any
            };

            const userWithImage = { ...mockUser, profilePicture: 'profile-images/test.jpg' };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue(userWithImage);
            (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

            const result = await service.uploadProfileImage('test-id', mockFile);

            expect(mockPrismaService.user.update).toHaveBeenCalled();
            expect(result.profilePicture).toContain('profile-images/');
        });

        it('should throw BadRequestException for null file', async () => {
            await expect(service.uploadProfileImage('test-id', null as any))
                .rejects
                .toThrow(BadRequestException);
        });
    });
});
