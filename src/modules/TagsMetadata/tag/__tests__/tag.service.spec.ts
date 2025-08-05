import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TagService } from '../tag.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';

describe('TagService', () => {
    let service: TagService;
    let mockPrismaService: any;

    const mockTag = {
        id: 'test-tag-id',
        name: 'Fintech',
        description: 'Financial technology',
        createdAt: new Date('2025-07-30T10:30:00.000Z'),
        updatedAt: new Date('2025-07-30T10:30:00.000Z')
    };

    beforeEach(async () => {
        const mockPrisma = {
            tag: {
                create: jest.fn().mockResolvedValue(mockTag),
                findMany: jest.fn().mockResolvedValue([mockTag]),
                findUnique: jest.fn().mockResolvedValue(mockTag),
                findFirst: jest.fn().mockResolvedValue(mockTag),
                update: jest.fn().mockResolvedValue(mockTag),
                delete: jest.fn().mockResolvedValue(mockTag),
                count: jest.fn().mockResolvedValue(1)
            }
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();

        service = module.get<TagService>(TagService);
        mockPrismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return an array of tags', async () => {
            const tags = [mockTag];
            (mockPrismaService.tag.findMany as jest.Mock).mockResolvedValue(
                tags
            );

            const result = await service.findAll();

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith();
            expect(result).toEqual(tags);
        });
    });

    describe('findOne', () => {
        it('should return a tag when found', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                mockTag
            );

            const result = await service.findOne('test-tag-id');

            expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-tag-id' }
            });
            expect(result).toEqual(mockTag);
        });

        it('should throw NotFoundException when tag not found', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                null
            );

            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('findByName', () => {
        it('should return a tag when found by name', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                mockTag
            );

            const result = await service.findByName('Fintech');

            expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
                where: { name: 'Fintech' }
            });
            expect(result).toEqual(mockTag);
        });

        it('should return null when tag not found by name', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                null
            );

            const result = await service.findByName('NonExistent');

            expect(result).toBeNull();
        });

        it('should trim the name before searching', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                mockTag
            );

            await service.findByName('  Fintech  ');

            expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
                where: { name: 'Fintech' }
            });
        });
    });

    describe('createTag', () => {
        const createTagDto: CreateTagDto = {
            name: 'Fintech',
            description: 'Financial technology'
        };

        it('should create a tag successfully', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                null
            ); // No existing tag
            (mockPrismaService.tag.create as jest.Mock).mockResolvedValue(
                mockTag
            );

            const result = await service.createTag(createTagDto);

            expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
                where: { name: 'Fintech' }
            });
            expect(mockPrismaService.tag.create).toHaveBeenCalledWith({
                data: createTagDto
            });
            expect(result).toEqual(mockTag);
        });

        it('should throw ConflictException when tag name already exists', async () => {
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                mockTag
            ); // Existing tag

            await expect(service.createTag(createTagDto)).rejects.toThrow(
                ConflictException
            );
            expect(mockPrismaService.tag.create).not.toHaveBeenCalled();
        });
    });

    describe('updateTag', () => {
        const updateTagDto: UpdateTagDto = {
            name: 'Updated Fintech',
            description: 'Updated description'
        };

        it('should update a tag successfully', async () => {
            mockPrismaService.tag.findUnique
                .mockResolvedValueOnce(mockTag) // findOneOrFail
                .mockResolvedValueOnce(null); // findByName check

            mockPrismaService.tag.update.mockResolvedValue({
                ...mockTag,
                ...updateTagDto
            });

            const result = await service.updateTag('test-tag-id', updateTagDto);

            expect(mockPrismaService.tag.update).toHaveBeenCalledWith({
                where: { id: 'test-tag-id' },
                data: updateTagDto
            });
            expect(result.name).toBe('Updated Fintech');
        });

        it('should throw NotFoundException when tag does not exist', async () => {
            mockPrismaService.tag.findUnique.mockResolvedValue(null);

            await expect(
                service.updateTag('non-existent-id', updateTagDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException when new name already exists for different tag', async () => {
            const otherTag = { ...mockTag, id: 'other-id' };

            mockPrismaService.tag.findUnique
                .mockResolvedValueOnce(mockTag) // findOneOrFail
                .mockResolvedValueOnce(otherTag); // findByName check

            await expect(
                service.updateTag('test-tag-id', updateTagDto)
            ).rejects.toThrow(ConflictException);
            expect(mockPrismaService.tag.update).not.toHaveBeenCalled();
        });

        it('should allow updating with same name', async () => {
            const updateDto = {
                name: 'Fintech',
                description: 'Updated description'
            };

            mockPrismaService.tag.findUnique
                .mockResolvedValueOnce(mockTag) // findOneOrFail
                .mockResolvedValueOnce(mockTag); // findByName check - same tag

            mockPrismaService.tag.update.mockResolvedValue({
                ...mockTag,
                description: 'Updated description'
            });

            const result = await service.updateTag('test-tag-id', updateDto);

            expect(mockPrismaService.tag.update).toHaveBeenCalled();
            expect(result.description).toBe('Updated description');
        });
    });

    describe('remove', () => {
        it('should delete a tag successfully', async () => {
            mockPrismaService.tag.delete.mockResolvedValue(mockTag);

            const result = await service.remove('test-tag-id');

            expect(mockPrismaService.tag.delete).toHaveBeenCalledWith({
                where: { id: 'test-tag-id' }
            });
            expect(result).toEqual(mockTag);
        });
    });

    describe('searchByName', () => {
        it('should search tags by name', async () => {
            const tags = [mockTag];
            mockPrismaService.tag.findMany.mockResolvedValue(tags);

            const result = await service.searchByName('Fin');

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'Fin',
                        mode: 'insensitive'
                    }
                },
                orderBy: { name: 'asc' }
            });
            expect(result).toEqual(tags);
        });

        it('should trim search term', async () => {
            mockPrismaService.tag.findMany.mockResolvedValue([]);

            await service.searchByName('  Fin  ');

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: {
                    name: {
                        contains: 'Fin',
                        mode: 'insensitive'
                    }
                },
                orderBy: { name: 'asc' }
            });
        });
    });

    describe('findAllWithUsageCount', () => {
        it('should return tags with usage count', async () => {
            const tagsWithCount = [
                {
                    ...mockTag,
                    _count: {
                        projectTags: 5,
                        PostTag: 3
                    }
                }
            ];
            mockPrismaService.tag.findMany.mockResolvedValue(tagsWithCount);

            const result = await service.findAllWithUsageCount();

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                include: {
                    _count: {
                        select: {
                            projectTags: true,
                            PostTag: true
                        }
                    }
                },
                orderBy: { name: 'asc' }
            });
            expect(result).toEqual(tagsWithCount);
        });
    });

    describe('findMostUsedTags', () => {
        it('should return most used tags with default limit', async () => {
            const tagsWithCount = [
                {
                    ...mockTag,
                    id: 'tag1',
                    name: 'AI',
                    _count: { projectTags: 10, PostTag: 5 }
                },
                {
                    ...mockTag,
                    id: 'tag2',
                    name: 'Fintech',
                    _count: { projectTags: 3, PostTag: 2 }
                }
            ];
            mockPrismaService.tag.findMany.mockResolvedValue(tagsWithCount);

            const result = await service.findMostUsedTags();

            expect(result).toHaveLength(2);
            expect(result[0].totalUsage).toBe(15); // AI: 10 + 5
            expect(result[1].totalUsage).toBe(5); // Fintech: 3 + 2
            expect(result[0].name).toBe('AI');
        });

        it('should respect custom limit', async () => {
            const tagsWithCount = Array.from({ length: 15 }, (_, i) => ({
                ...mockTag,
                id: `tag${i}`,
                name: `Tag ${i}`,
                _count: { projectTags: i, PostTag: i }
            }));
            mockPrismaService.tag.findMany.mockResolvedValue(tagsWithCount);

            const result = await service.findMostUsedTags(5);

            expect(result).toHaveLength(5);
        });
    });

    describe('findProjectTags', () => {
        it('should return tags used in projects', async () => {
            const tags = [mockTag];
            mockPrismaService.tag.findMany.mockResolvedValue(tags);

            const result = await service.findProjectTags();

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: {
                    projectTags: {
                        some: {}
                    }
                },
                orderBy: { name: 'asc' }
            });
            expect(result).toEqual(tags);
        });
    });

    describe('findPostTags', () => {
        it('should return tags used in posts', async () => {
            const tags = [mockTag];
            mockPrismaService.tag.findMany.mockResolvedValue(tags);

            const result = await service.findPostTags();

            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: {
                    PostTag: {
                        some: {}
                    }
                },
                orderBy: { name: 'asc' }
            });
            expect(result).toEqual(tags);
        });
    });
});
