import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/services/prisma.service';
import { TokenBlacklistService } from '../../../core/services/token-blacklist.service';
import * as authUtils from '../../../core/utils/auth'; // added import
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

describe('AuthService', () => {
    let service: AuthService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn()
        }
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('jwt_token'),
        verify: jest.fn()
    };

    const mockMailerService = {
        sendMail: jest.fn()
    };

    const mockUserService = {
        // Mock methods if needed
    };

    const mockTokenBlacklistService = {
        blacklistToken: jest.fn(),
        blacklistAllUserTokens: jest.fn(),
        isTokenBlacklisted: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: MailerService,
                    useValue: mockMailerService
                },
                {
                    provide: UserService,
                    useValue: mockUserService
                },
                {
                    provide: TokenBlacklistService,
                    useValue: mockTokenBlacklistService
                }
            ]
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signIn', () => {
        it('should successfully login and return tokens', async () => {
            const loginDto = {
                email: 'user@example.com',
                password: 'StrongPass123!'
            };
            // Provide additional fields if required by signIn, including isEmailVerified: true
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: '1',
                email: loginDto.email,
                name: 'Test User',
                password: 'hashed',
                image: 'image.jpg',
                isEmailVerified: true // added to pass verification
            });
            // Force comparePassword to resolve true
            jest.spyOn(authUtils, 'comparePassword').mockResolvedValue(true);

            const result = await service.signIn(loginDto);
            expect(result).toEqual({
                token: 'jwt_token',
                refreshToken: 'jwt_token'
            });
            expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
        });
    });

    describe('logout', () => {
        it('should successfully logout without userId and token', async () => {
            const result = await service.logout();

            expect(result).toEqual({
                message: 'Logout successful. Token has been invalidated.',
                instructions: [
                    'Token has been blacklisted on server',
                    'Remove access token from localStorage/sessionStorage',
                    'Clear refresh token',
                    'Redirect to login page'
                ]
            });
        });

        it('should successfully logout with valid userId', async () => {
            const userId = 'user-123';
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: userId,
                email: 'user@example.com',
                name: 'Test User'
            });

            mockPrismaService.user.update.mockResolvedValue({
                id: userId,
                email: 'user@example.com',
                name: 'Test User',
                lastLogoutAt: new Date()
            });

            const result = await service.logout(userId);

            expect(result).toEqual({
                message: 'Logout successful. Token has been invalidated.',
                instructions: [
                    'Token has been blacklisted on server',
                    'Remove access token from localStorage/sessionStorage',
                    'Clear refresh token',
                    'Redirect to login page'
                ]
            });
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId }
            });
            expect(mockPrismaService.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { lastLogoutAt: expect.any(Date) }
            });
        });

        it('should blacklist token when provided', async () => {
            const userId = 'user-123';
            const token = 'sample-token';

            mockPrismaService.user.findUnique.mockResolvedValue({
                id: userId,
                email: 'user@example.com',
                name: 'Test User'
            });

            mockPrismaService.user.update.mockResolvedValue({});
            mockTokenBlacklistService.blacklistToken.mockResolvedValue(
                undefined
            );

            await service.logout(userId, token);

            expect(
                mockTokenBlacklistService.blacklistToken
            ).toHaveBeenCalledWith(token, userId, 'logout');
        });

        it('should logout from all devices when requested', async () => {
            const userId = 'user-123';

            mockPrismaService.user.findUnique.mockResolvedValue({
                id: userId,
                email: 'user@example.com',
                name: 'Test User'
            });

            mockPrismaService.user.update.mockResolvedValue({});
            mockTokenBlacklistService.blacklistAllUserTokens.mockResolvedValue(
                undefined
            );

            await service.logout(userId, undefined, true);

            expect(
                mockTokenBlacklistService.blacklistAllUserTokens
            ).toHaveBeenCalledWith(userId, 'logout_all_devices');
        });

        it('should throw error for invalid userId', async () => {
            const userId = 'invalid-user-id';
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(service.logout(userId)).rejects.toThrow(
                'User not found'
            );
            expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId }
            });
        });
    });

    describe('isTokenValid', () => {
        it('should return false for blacklisted token', async () => {
            const token = 'blacklisted-token';
            mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(
                true
            );

            const result = await service.isTokenValid(token);

            expect(result).toBe(false);
            expect(
                mockTokenBlacklistService.isTokenBlacklisted
            ).toHaveBeenCalledWith(token);
        });

        it('should return true for valid token', async () => {
            const token = 'valid-token';
            mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(
                false
            );

            const result = await service.isTokenValid(token);

            expect(result).toBe(true);
        });
    });
});
