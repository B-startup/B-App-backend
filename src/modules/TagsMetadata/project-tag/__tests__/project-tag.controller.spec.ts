import { Test, TestingModule } from '@nestjs/testing';
import { ProjectTagController } from '../project-tag.controller';
import { ProjectTagService } from '../project-tag.service';

describe('ProjectTagController', () => {
    let controller: ProjectTagController;
    let mockProjectTagService: any;

    const mockProjectTag = {
        id: 'test-association-id',
        projectId: 'test-project-id',
        tagId: 'test-tag-id',
        createdAt: new Date('2025-07-30T10:30:00.000Z')
    };

    beforeEach(async () => {
        const mockService = {
            createAssociation: jest.fn(),
            addMultipleTagsToProject: jest.fn(),
            findByProject: jest.fn(),
            findByProjectWithTags: jest.fn(),
            findByTag: jest.fn(),
            findByTagWithProjects: jest.fn(),
            removeAssociation: jest.fn(),
            findPopularTags: jest.fn(),
            findSimilarProjects: jest.fn(),
            countByProject: jest.fn(),
            countByTag: jest.fn()
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectTagController],
            providers: [
                {
                    provide: ProjectTagService,
                    useValue: mockService
                }
            ]
        }).compile();

        controller = module.get<ProjectTagController>(ProjectTagController);
        mockProjectTagService = module.get(ProjectTagService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createAssociation', () => {
        it('should create a new project-tag association', async () => {
            const createDto = {
                projectId: 'test-project-id',
                tagId: 'test-tag-id'
            };
            (
                mockProjectTagService.createAssociation as jest.Mock
            ).mockResolvedValue(mockProjectTag);

            const result = await controller.createAssociation(createDto);

            expect(
                mockProjectTagService.createAssociation
            ).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(mockProjectTag);
        });
    });

    describe('addMultipleTags', () => {
        it('should add multiple tags to a project', async () => {
            const body = {
                projectId: 'test-project-id',
                tagIds: ['tag1', 'tag2', 'tag3']
            };
            const mockResult = [mockProjectTag, mockProjectTag, mockProjectTag];
            (
                mockProjectTagService.addMultipleTagsToProject as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.addMultipleTags(body);

            expect(
                mockProjectTagService.addMultipleTagsToProject
            ).toHaveBeenCalledWith(body.projectId, body.tagIds);
            expect(result).toEqual(mockResult);
        });
    });

    describe('findByProject', () => {
        it('should return tags for a project without details', async () => {
            const mockResult = [mockProjectTag];
            (
                mockProjectTagService.findByProject as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.findByProject(
                'test-project-id',
                false
            );

            expect(mockProjectTagService.findByProject).toHaveBeenCalledWith(
                'test-project-id'
            );
            expect(result).toEqual(mockResult);
        });

        it('should return tags for a project with details', async () => {
            const mockResult = [
                { ...mockProjectTag, tag: { id: 'tag1', name: 'Tag 1' } }
            ];
            (
                mockProjectTagService.findByProjectWithTags as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.findByProject(
                'test-project-id',
                true
            );

            expect(
                mockProjectTagService.findByProjectWithTags
            ).toHaveBeenCalledWith('test-project-id');
            expect(result).toEqual(mockResult);
        });
    });

    describe('findByTag', () => {
        it('should return projects for a tag without details', async () => {
            const mockResult = [mockProjectTag];
            (mockProjectTagService.findByTag as jest.Mock).mockResolvedValue(
                mockResult
            );

            const result = await controller.findByTag('test-tag-id', false);

            expect(mockProjectTagService.findByTag).toHaveBeenCalledWith(
                'test-tag-id'
            );
            expect(result).toEqual(mockResult);
        });

        it('should return projects for a tag with details', async () => {
            const mockResult = [
                {
                    ...mockProjectTag,
                    project: { id: 'project1', title: 'Project 1' }
                }
            ];
            (
                mockProjectTagService.findByTagWithProjects as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.findByTag('test-tag-id', true);

            expect(
                mockProjectTagService.findByTagWithProjects
            ).toHaveBeenCalledWith('test-tag-id');
            expect(result).toEqual(mockResult);
        });
    });

    describe('removeAssociation', () => {
        it('should remove a project-tag association', async () => {
            const body = {
                projectId: 'test-project-id',
                tagId: 'test-tag-id'
            };
            (
                mockProjectTagService.removeAssociation as jest.Mock
            ).mockResolvedValue(undefined);

            await controller.removeAssociation(body);

            expect(
                mockProjectTagService.removeAssociation
            ).toHaveBeenCalledWith(body.projectId, body.tagId);
        });
    });

    describe('findPopularTags', () => {
        it('should return popular tags with default limit', async () => {
            const mockResult = [
                { id: 'tag1', name: 'Tag 1', projectCount: 10 },
                { id: 'tag2', name: 'Tag 2', projectCount: 8 }
            ];
            (
                mockProjectTagService.findPopularTags as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.findPopularTags();

            expect(mockProjectTagService.findPopularTags).toHaveBeenCalledWith(
                10
            );
            expect(result).toEqual(mockResult);
        });

        it('should return popular tags with custom limit', async () => {
            const mockResult = [
                { id: 'tag1', name: 'Tag 1', projectCount: 10 }
            ];
            (
                mockProjectTagService.findPopularTags as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.findPopularTags(5);

            expect(mockProjectTagService.findPopularTags).toHaveBeenCalledWith(
                5
            );
            expect(result).toEqual(mockResult);
        });
    });

    describe('findSimilarProjects', () => {
        it('should return similar projects with default limit', async () => {
            const mockResult = [
                { id: 'project1', title: 'Similar Project 1' },
                { id: 'project2', title: 'Similar Project 2' }
            ];
            (
                mockProjectTagService.findSimilarProjects as jest.Mock
            ).mockResolvedValue(mockResult);

            const result =
                await controller.findSimilarProjects('test-project-id');

            expect(
                mockProjectTagService.findSimilarProjects
            ).toHaveBeenCalledWith('test-project-id', 5);
            expect(result).toEqual(mockResult);
        });

        it('should return similar projects with custom limit', async () => {
            const mockResult = [{ id: 'project1', title: 'Similar Project 1' }];
            (
                mockProjectTagService.findSimilarProjects as jest.Mock
            ).mockResolvedValue(mockResult);

            const result = await controller.findSimilarProjects(
                'test-project-id',
                3
            );

            expect(
                mockProjectTagService.findSimilarProjects
            ).toHaveBeenCalledWith('test-project-id', 3);
            expect(result).toEqual(mockResult);
        });
    });

    describe('countByProject', () => {
        it('should return tag count for a project', async () => {
            (
                mockProjectTagService.countByProject as jest.Mock
            ).mockResolvedValue(5);

            const result = await controller.countByProject('test-project-id');

            expect(mockProjectTagService.countByProject).toHaveBeenCalledWith(
                'test-project-id'
            );
            expect(result).toEqual({ count: 5 });
        });
    });

    describe('countByTag', () => {
        it('should return project count for a tag', async () => {
            (mockProjectTagService.countByTag as jest.Mock).mockResolvedValue(
                12
            );

            const result = await controller.countByTag('test-tag-id');

            expect(mockProjectTagService.countByTag).toHaveBeenCalledWith(
                'test-tag-id'
            );
            expect(result).toEqual({ count: 12 });
        });
    });
});
