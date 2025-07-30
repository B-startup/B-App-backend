import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PostSectorService } from '../post-sector.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreatePostSectorDto } from '../dto/create-post-sector.dto';

describe('PostSectorService', () => {
    let service: PostSectorService;
    let mockPrismaService: any;

    const mockPostSector = {
        id: 'test-association-id',
        postId: 'test-post-id',
        sectorId: 'test-sector-id',
        createdAt: new Date('2025-07-30T10:30:00.000Z'),
        updatedAt: new Date('2025-07-30T10:30:00.000Z')
    };

    const mockPost = {
        id: 'test-post-id',
        title: 'Test Post',
        content: 'Test content'
    };

    const mockSector = {
        id: 'test-sector-id',
        name: 'Fintech',
        description: 'Financial technology'
    };

    beforeEach(async () => {
        const mockPrisma = {
            postSector: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                count: jest.fn(),
                groupBy: jest.fn()
            },
            post: {
                findUnique: jest.fn()
            },
            sector: {
                findUnique: jest.fn(),
                findMany: jest.fn()
            }
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostSectorService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();

        service = module.get<PostSectorService>(PostSectorService);
        mockPrismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAssociation', () => {
        const createDto: CreatePostSectorDto = {
            postId: 'test-post-id',
            sectorId: 'test-sector-id'
        };

        it('should create association successfully', async () => {
            mockPrismaService.postSector.findFirst.mockResolvedValue(null); // No existing association
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
            mockPrismaService.sector.findUnique.mockResolvedValue(mockSector);
            mockPrismaService.postSector.create.mockResolvedValue(mockPostSector);

            const result = await service.createAssociation(createDto);

            expect(mockPrismaService.postSector.findFirst).toHaveBeenCalledWith({
                where: {
                    postId: 'test-post-id',
                    sectorId: 'test-sector-id'
                }
            });
            expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-post-id' }
            });
            expect(mockPrismaService.sector.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-sector-id' }
            });
            expect(mockPrismaService.postSector.create).toHaveBeenCalledWith({
                data: createDto
            });
            expect(result).toEqual(mockPostSector);
        });

        it('should throw ConflictException when association already exists', async () => {
            mockPrismaService.postSector.findFirst.mockResolvedValue(mockPostSector);

            await expect(service.createAssociation(createDto)).rejects.toThrow(
                ConflictException
            );
            expect(mockPrismaService.post.findUnique).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when post not found', async () => {
            mockPrismaService.postSector.findFirst.mockResolvedValue(null);
            mockPrismaService.post.findUnique.mockResolvedValue(null);

            await expect(service.createAssociation(createDto)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw NotFoundException when sector not found', async () => {
            mockPrismaService.postSector.findFirst.mockResolvedValue(null);
            mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
            mockPrismaService.sector.findUnique.mockResolvedValue(null);

            await expect(service.createAssociation(createDto)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('findByPost', () => {
        it('should return associations for a post', async () => {
            const associations = [mockPostSector];
            mockPrismaService.postSector.findMany.mockResolvedValue(associations);

            const result = await service.findByPost('test-post-id');

            expect(mockPrismaService.postSector.findMany).toHaveBeenCalledWith({
                where: { postId: 'test-post-id' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(associations);
        });
    });

    describe('findBySector', () => {
        it('should return associations for a sector', async () => {
            const associations = [mockPostSector];
            mockPrismaService.postSector.findMany.mockResolvedValue(associations);

            const result = await service.findBySector('test-sector-id');

            expect(mockPrismaService.postSector.findMany).toHaveBeenCalledWith({
                where: { sectorId: 'test-sector-id' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual(associations);
        });
    });

    describe('removeAssociation', () => {
        it('should remove association successfully', async () => {
            mockPrismaService.postSector.findFirst.mockResolvedValue(mockPostSector);
            mockPrismaService.postSector.delete.mockResolvedValue(mockPostSector);

            const result = await service.removeAssociation('test-post-id', 'test-sector-id');

            expect(mockPrismaService.postSector.findFirst).toHaveBeenCalledWith({
                where: {
                    postId: 'test-post-id',
                    sectorId: 'test-sector-id'
                }
            });
            expect(mockPrismaService.postSector.delete).toHaveBeenCalledWith({
                where: { id: 'test-association-id' }
            });
            expect(result).toEqual(mockPostSector);
        });

        it('should throw NotFoundException when association not found', async () => {
            mockPrismaService.postSector.findFirst.mockResolvedValue(null);

            await expect(service.removeAssociation('test-post-id', 'test-sector-id')).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('countByPost', () => {
        it('should return count of associations for a post', async () => {
            mockPrismaService.postSector.count.mockResolvedValue(3);

            const result = await service.countByPost('test-post-id');

            expect(mockPrismaService.postSector.count).toHaveBeenCalledWith({
                where: { postId: 'test-post-id' }
            });
            expect(result).toBe(3);
        });
    });

    describe('findPopularSectors', () => {
        it('should return popular sectors with post counts', async () => {
            const groupByResult = [
                { sectorId: 'sector-1', _count: { postId: 10 } },
                { sectorId: 'sector-2', _count: { postId: 5 } }
            ];
            const sectors = [
                { id: 'sector-1', name: 'Fintech', description: 'Financial tech' },
                { id: 'sector-2', name: 'Healthcare', description: 'Health tech' }
            ];

            mockPrismaService.postSector.groupBy.mockResolvedValue(groupByResult);
            mockPrismaService.sector.findMany.mockResolvedValue(sectors);

            const result = await service.findPopularSectors(2);

            expect(mockPrismaService.postSector.groupBy).toHaveBeenCalledWith({
                by: ['sectorId'],
                _count: { postId: true },
                orderBy: { _count: { postId: 'desc' } },
                take: 2
            });

            expect(result).toEqual([
                { ...sectors[0], postCount: 10 },
                { ...sectors[1], postCount: 5 }
            ]);
        });
    });
});
