import { Test, TestingModule } from '@nestjs/testing';
import { TokenBlacklistGuard } from '../guards/token-blacklist.guard';
import { ResourceOwnerGuard } from '../guards/resource-owner.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../../services/token-blacklist.service';
import { PrismaService } from '../../services/prisma.service';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('Security Guards', () => {
    let tokenBlacklistGuard: TokenBlacklistGuard;
    let resourceOwnerGuard: ResourceOwnerGuard;
    let mockJwtService: jest.Mocked<JwtService>;
    let mockConfigService: jest.Mocked<ConfigService>;
    let mockTokenBlacklistService: jest.Mocked<TokenBlacklistService>;
    let mockPrismaService: any;
    let mockReflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const mockJwt = {
            verifyAsync: jest.fn()
        };

        const mockConfig = {
            get: jest.fn().mockReturnValue('test-secret')
        };

        const mockBlacklist = {
            isTokenBlacklisted: jest.fn()
        };

        const mockPrisma = {
            user: {
                findUnique: jest.fn()
            },
            comment: {
                findUnique: jest.fn()
            },
            post: {
                findUnique: jest.fn()
            },
            project: {
                findUnique: jest.fn()
            }
        } as any;

        const mockRefl = {
            get: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenBlacklistGuard,
                ResourceOwnerGuard,
                { provide: JwtService, useValue: mockJwt },
                { provide: ConfigService, useValue: mockConfig },
                { provide: TokenBlacklistService, useValue: mockBlacklist },
                { provide: PrismaService, useValue: mockPrisma },
                { provide: Reflector, useValue: mockRefl }
            ]
        }).compile();

        tokenBlacklistGuard = module.get<TokenBlacklistGuard>(TokenBlacklistGuard);
        resourceOwnerGuard = module.get<ResourceOwnerGuard>(ResourceOwnerGuard);
        mockJwtService = module.get(JwtService);
        mockConfigService = module.get(ConfigService);
        mockTokenBlacklistService = module.get(TokenBlacklistService);
        mockPrismaService = module.get(PrismaService);
        mockReflector = module.get(Reflector);
    });

    describe('TokenBlacklistGuard', () => {
        it('should be defined', () => {
            expect(tokenBlacklistGuard).toBeDefined();
        });

        it('should reject requests without token', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {}
                    })
                })
            } as ExecutionContext;

            await expect(tokenBlacklistGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
        });

        it('should reject blacklisted tokens', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: {
                            authorization: 'Bearer valid-token'
                        }
                    })
                })
            } as ExecutionContext;

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-123', iat: Date.now() / 1000 });
            mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

            await expect(tokenBlacklistGuard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
        });

        it('should allow valid tokens', async () => {
            const request = {
                headers: {
                    authorization: 'Bearer valid-token'
                }
            };

            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => request
                })
            } as ExecutionContext;

            mockJwtService.verifyAsync.mockResolvedValue({ sub: 'user-123', iat: Date.now() / 1000 });
            mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
            mockPrismaService.user.findUnique.mockResolvedValue({ lastLogoutAt: null });

            const result = await tokenBlacklistGuard.canActivate(mockContext);
            
            expect(result).toBe(true);
            expect(request['user']).toBeDefined();
            expect(request['token']).toBe('valid-token');
        });
    });

    describe('ResourceOwnerGuard', () => {
        it('should be defined', () => {
            expect(resourceOwnerGuard).toBeDefined();
        });

        it('should allow access when no resource type is specified', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { sub: 'user-123' },
                        params: { id: 'resource-id' }
                    })
                }),
                getHandler: () => ({})
            } as ExecutionContext;

            mockReflector.get.mockReturnValue(undefined);

            const result = await resourceOwnerGuard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should allow access for resource owner', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { sub: 'user-123' },
                        params: { id: 'comment-id' }
                    })
                }),
                getHandler: () => ({})
            } as ExecutionContext;

            mockReflector.get.mockReturnValue('comment');
            mockPrismaService.comment.findUnique.mockResolvedValue({ userId: 'user-123' });

            const result = await resourceOwnerGuard.canActivate(mockContext);
            expect(result).toBe(true);
        });

        it('should reject non-owner', async () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        user: { sub: 'user-123' },
                        params: { id: 'comment-id' }
                    })
                }),
                getHandler: () => ({})
            } as ExecutionContext;

            mockReflector.get.mockReturnValue('comment');
            mockPrismaService.comment.findUnique.mockResolvedValue({ userId: 'other-user' });

            await expect(resourceOwnerGuard.canActivate(mockContext)).rejects.toThrow(ForbiddenException);
        });
    });
});
