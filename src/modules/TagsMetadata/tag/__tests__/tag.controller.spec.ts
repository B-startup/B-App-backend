import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from '../tag.controller';
import { TagService } from '../tag.service';
import { CreateTagDto } from '../dto/create-tag.dto';
import { UpdateTagDto } from '../dto/update-tag.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('TagController', () => {
    let controller: TagController;
    let mockTagService: jest.Mocked<TagService>;

    const mockTag = {
        id: 'test-tag-id',
        name: 'Fintech',
        description: 'Financial technology',
        createdAt: new Date('2025-07-30T10:30:00.000Z'),
        updatedAt: new Date('2025-07-30T10:30:00.000Z')
    };

    beforeEach(async () => {
        const mockService = {
            createTag: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateTag: jest.fn(),
            remove: jest.fn(),
            searchByName: jest.fn(),
            findAllWithUsageCount: jest.fn(),
            findMostUsedTags: jest.fn(),
            findProjectTags: jest.fn(),
            findPostTags: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [TagController],
            providers: [
                {
                    provide: TagService,
                    useValue: mockService
                }
            ]
        }).compile();

        controller = module.get<TagController>(TagController);
        mockTagService = module.get(TagService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createTagDto: CreateTagDto = {
            name: 'Fintech',
            description: 'Financial technology'
        };

        it('should create a tag successfully', async () => {
            mockTagService.createTag.mockResolvedValue(mockTag);

            const result = await controller.create(createTagDto);

            expect(mockTagService.createTag).toHaveBeenCalledWith(createTagDto);
            expect(result).toEqual(mockTag);
        });

        it('should handle ConflictException from service', async () => {
            mockTagService.createTag.mockRejectedValue(
                new ConflictException('Tag with name "Fintech" already exists')
            );

            await expect(controller.create(createTagDto)).rejects.toThrow(
                ConflictException
            );
        });
    });

    describe('findAll', () => {
        it('should return all tags without additional options', async () => {
            const tags = [mockTag];
            mockTagService.findAll.mockResolvedValue(tags);

            const result = await controller.findAll();

            expect(mockTagService.findAll).toHaveBeenCalledWith();
            expect(result).toEqual(tags);
        });

        it('should search tags by name when search query provided', async () => {
            const tags = [mockTag];
            mockTagService.searchByName.mockResolvedValue(tags);

            const result = await controller.findAll(undefined, 'Fin');

            expect(mockTagService.searchByName).toHaveBeenCalledWith('Fin');
            expect(mockTagService.findAll).not.toHaveBeenCalled();
            expect(result).toEqual(tags);
        });

        it('should return tags with usage count when withUsageCount is true', async () => {
            const tagsWithCount = [
                {
                    ...mockTag,
                    _count: { projectTags: 5, PostTag: 3 }
                }
            ];
            mockTagService.findAllWithUsageCount.mockResolvedValue(tagsWithCount);

            const result = await controller.findAll(true);

            expect(mockTagService.findAllWithUsageCount).toHaveBeenCalledWith();
            expect(mockTagService.findAll).not.toHaveBeenCalled();
            expect(result).toEqual(tagsWithCount);
        });

        it('should prioritize search over withUsageCount', async () => {
            const tags = [mockTag];
            mockTagService.searchByName.mockResolvedValue(tags);

            const result = await controller.findAll(true, 'Fin');

            expect(mockTagService.searchByName).toHaveBeenCalledWith('Fin');
            expect(mockTagService.findAllWithUsageCount).not.toHaveBeenCalled();
            expect(mockTagService.findAll).not.toHaveBeenCalled();
            expect(result).toEqual(tags);
        });
    });

    describe('findMostUsed', () => {
        it('should return most used tags with default limit', async () => {
            const mostUsedTags = [
                { ...mockTag, totalUsage: 10 }
            ];
            mockTagService.findMostUsedTags.mockResolvedValue(mostUsedTags);

            const result = await controller.findMostUsed();

            expect(mockTagService.findMostUsedTags).toHaveBeenCalledWith(10);
            expect(result).toEqual(mostUsedTags);
        });

        it('should return most used tags with custom limit', async () => {
            const mostUsedTags = [
                { ...mockTag, totalUsage: 10 }
            ];
            mockTagService.findMostUsedTags.mockResolvedValue(mostUsedTags);

            const result = await controller.findMostUsed('5');

            expect(mockTagService.findMostUsedTags).toHaveBeenCalledWith(5);
            expect(result).toEqual(mostUsedTags);
        });
    });

    describe('findProjectTags', () => {
        it('should return project tags', async () => {
            const tags = [mockTag];
            mockTagService.findProjectTags.mockResolvedValue(tags);

            const result = await controller.findProjectTags();

            expect(mockTagService.findProjectTags).toHaveBeenCalledWith();
            expect(result).toEqual(tags);
        });
    });

    describe('findPostTags', () => {
        it('should return post tags', async () => {
            const tags = [mockTag];
            mockTagService.findPostTags.mockResolvedValue(tags);

            const result = await controller.findPostTags();

            expect(mockTagService.findPostTags).toHaveBeenCalledWith();
            expect(result).toEqual(tags);
        });
    });

    describe('findOne', () => {
        it('should return a tag by id', async () => {
            mockTagService.findOne.mockResolvedValue(mockTag);

            const result = await controller.findOne('test-tag-id');

            expect(mockTagService.findOne).toHaveBeenCalledWith('test-tag-id');
            expect(result).toEqual(mockTag);
        });

        it('should handle NotFoundException from service', async () => {
            mockTagService.findOne.mockRejectedValue(
                new NotFoundException('Tag not found')
            );

            await expect(controller.findOne('non-existent-id')).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('update', () => {
        const updateTagDto: UpdateTagDto = {
            name: 'Updated Fintech',
            description: 'Updated description'
        };

        it('should update a tag successfully', async () => {
            const updatedTag = { ...mockTag, ...updateTagDto };
            mockTagService.updateTag.mockResolvedValue(updatedTag);

            const result = await controller.update('test-tag-id', updateTagDto);

            expect(mockTagService.updateTag).toHaveBeenCalledWith('test-tag-id', updateTagDto);
            expect(result).toEqual(updatedTag);
        });

        it('should handle NotFoundException from service', async () => {
            mockTagService.updateTag.mockRejectedValue(
                new NotFoundException('Tag not found')
            );

            await expect(controller.update('non-existent-id', updateTagDto)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should handle ConflictException from service', async () => {
            mockTagService.updateTag.mockRejectedValue(
                new ConflictException('Tag name already exists')
            );

            await expect(controller.update('test-tag-id', updateTagDto)).rejects.toThrow(
                ConflictException
            );
        });
    });

    describe('remove', () => {
        it('should delete a tag successfully', async () => {
            mockTagService.remove.mockResolvedValue(mockTag);

            await controller.remove('test-tag-id');

            expect(mockTagService.remove).toHaveBeenCalledWith('test-tag-id');
        });

        it('should handle NotFoundException from service', async () => {
            mockTagService.remove.mockRejectedValue(
                new NotFoundException('Tag not found')
            );

            await expect(controller.remove('non-existent-id')).rejects.toThrow(
                NotFoundException
            );
        });
    });
});
