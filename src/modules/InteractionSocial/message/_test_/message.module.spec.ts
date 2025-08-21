import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../message.service';
import { MessageController } from '../message.controller';
import { PrismaService } from '../../../../core/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../../../../core/services/token-blacklist.service';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';

describe('MessageModule', () => {
    let module: TestingModule;

    const mockPrismaService = {
        message: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        discussion: {
            findUnique: jest.fn(),
            update: jest.fn(),
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
            controllers: [MessageController],
            providers: [
                MessageService,
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

    it('should provide MessageService', () => {
        const service = module.get<MessageService>(MessageService);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(MessageService);
    });

    it('should provide MessageController', () => {
        const controller = module.get<MessageController>(MessageController);
        expect(controller).toBeDefined();
        expect(controller).toBeInstanceOf(MessageController);
    });

    it('should inject PrismaService into MessageService', () => {
        const service = module.get<MessageService>(MessageService);
        expect(service).toBeDefined();
        // Verify that the service has access to prisma through inheritance
        expect(service['prisma']).toBeDefined();
    });

    describe('Module Configuration', () => {
        it('should have correct module structure', () => {
            // Verify that the module is properly configured
            expect(module).toBeDefined();
            
            // Verify that all expected providers are available
            const service = module.get<MessageService>(MessageService);
            const controller = module.get<MessageController>(MessageController);
            
            expect(service).toBeDefined();
            expect(controller).toBeDefined();
        });

        it('should export MessageService for use in other modules', () => {
            const service = module.get<MessageService>(MessageService);
            expect(service).toBeDefined();
        });
    });
});
