import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from '../tag.service';
import { PrismaService } from '../../../../core/services/prisma.service';

describe('TagService - Simple Tests', () => {
    let service: TagService;

    beforeEach(async () => {
        const mockPrismaService = {
            tag: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                count: jest.fn()
            }
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService
                }
            ]
        }).compile();

        service = module.get<TagService>(TagService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should have all required methods', () => {
        expect(service.findAll).toBeDefined();
        expect(service.findOne).toBeDefined();
        expect(service.create).toBeDefined();
        expect(service.update).toBeDefined();
        expect(service.remove).toBeDefined();
        expect(service.findByName).toBeDefined();
        expect(service.createTag).toBeDefined();
        expect(service.updateTag).toBeDefined();
        expect(service.searchByName).toBeDefined();
        expect(service.findAllWithUsageCount).toBeDefined();
        expect(service.findMostUsedTags).toBeDefined();
        expect(service.findProjectTags).toBeDefined();
        expect(service.findPostTags).toBeDefined();
    });
});
