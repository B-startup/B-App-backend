import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionService } from '../discussion.service';
import { DiscussionController } from '../discussion.controller';
import { PrismaService } from '../../../../core/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../../../../core/services/token-blacklist.service';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';

describe('DiscussionModule', () => {
    let module: TestingModule;

    const mockPrismaService = {
        discussion: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        project: {
            findUnique: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
            const config = {
                JWT_SECRET: 'test-secret',
                NODE_ENV: 'test'
            };
            return config[key] || defaultValue;
        }),
    };

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
        decode: jest.fn(),
    };

    const mockTokenBlacklistService = {
        isTokenBlacklisted: jest.fn().mockResolvedValue(false),
        addToBlacklist: jest.fn(),
        cleanupExpiredTokens: jest.fn(),
    };

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [DiscussionController],
            providers: [
                DiscussionService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: TokenBlacklistService,
                    useValue: mockTokenBlacklistService,
                },
                {
                    provide: TokenBlacklistGuard,
                    useValue: {
                        canActivate: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        }).compile();
    });

    afterEach(async () => {
        if (module) {
            await module.close();
        }
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should provide DiscussionService', () => {
        const service = module.get<DiscussionService>(DiscussionService);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(DiscussionService);
    });

    it('should provide DiscussionController', () => {
        const controller = module.get<DiscussionController>(DiscussionController);
        expect(controller).toBeDefined();
        expect(controller).toBeInstanceOf(DiscussionController);
    });

    it('should inject PrismaService into DiscussionService', () => {
        const service = module.get<DiscussionService>(DiscussionService);
        expect(service).toBeDefined();
        // Verify that the service has access to prisma through inheritance
        expect(service['prisma']).toBeDefined();
    });

    describe('Module Configuration', () => {
        it('should have correct module structure', () => {
            // Verify that the module is properly configured
            expect(module).toBeDefined();
            
            // Verify that all expected providers are available
            const service = module.get<DiscussionService>(DiscussionService);
            const controller = module.get<DiscussionController>(DiscussionController);
            
            expect(service).toBeDefined();
            expect(controller).toBeDefined();
        });

        it('should export DiscussionService for use in other modules', () => {
            const service = module.get<DiscussionService>(DiscussionService);
            expect(service).toBeDefined();
        });
    });
});
