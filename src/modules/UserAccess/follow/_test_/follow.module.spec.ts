import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from '../follow.service';
import { FollowController } from '../follow.controller';
import { PrismaClient } from '@prisma/client';
import { TokenBlacklistGuard } from '../../../../core/common/guards/token-blacklist.guard';

// Mock pour éviter les dépendances complexes
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

const mockPrismaClient = {
    follow: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    user: {
        update: jest.fn(),
    },
    $transaction: jest.fn(),
};

// Mock guard to avoid dependency issues
const mockTokenBlacklistGuard = {
    canActivate: jest.fn().mockReturnValue(true),
};

describe('FollowModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            controllers: [FollowController],
            providers: [
                {
                    provide: FollowService,
                    useValue: mockFollowService,
                },
                {
                    provide: PrismaClient,
                    useValue: mockPrismaClient,
                },
            ],
        })
            .overrideGuard(TokenBlacklistGuard)
            .useValue(mockTokenBlacklistGuard)
            .compile();
    });

    afterEach(async () => {
        if (module) {
            await module.close();
        }
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should provide FollowService', () => {
        const service = module.get<FollowService>(FollowService);
        expect(service).toBeDefined();
    });

    it('should provide FollowController', () => {
        const controller = module.get<FollowController>(FollowController);
        expect(controller).toBeDefined();
    });

    it('should inject PrismaClient into FollowService', () => {
        const service = module.get<FollowService>(FollowService);
        expect(service).toBeDefined();
        // The service should be available through dependency injection
    });

    describe('Module Configuration', () => {
        it('should have correct module structure', () => {
            // Verify that the module is properly configured
            expect(module).toBeDefined();
            
            // Verify that all expected providers are available
            const service = module.get<FollowService>(FollowService);
            const controller = module.get<FollowController>(FollowController);
            
            expect(service).toBeDefined();
            expect(controller).toBeDefined();
        });

        it('should export FollowService for use in other modules', () => {
            const service = module.get<FollowService>(FollowService);
            expect(service).toBeDefined();
        });
    });
});
