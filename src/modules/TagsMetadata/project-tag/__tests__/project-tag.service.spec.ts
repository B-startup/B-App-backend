import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProjectTagService } from '../project-tag.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { CreateProjectTagDto } from '../dto/create-project-tag.dto';

describe('ProjectTagService', () => {
    let service: ProjectTagService;
    let mockPrismaService: any;

    const mockProjectTag = {
        id: 'test-association-id',
        projectId: 'test-project-id',
        tagId: 'test-tag-id',
        createdAt: new Date('2025-07-30T10:30:00.000Z'),
        project: {
            id: 'test-project-id',
            title: 'Test Project'
        },
        tag: {
            id: 'test-tag-id',
            name: 'test-tag'
        }
    };

    const mockProject = {
        id: 'test-project-id',
        title: 'Test Project',
        description: 'Test description'
    };

    const mockTag = {
        id: 'test-tag-id',
        name: 'test-tag',
        description: 'Test tag description'
    };

    beforeEach(async () => {
        const mockPrisma = {
            projectTag: {
                create: jest.fn(),
                createMany: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                findFirst: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                deleteMany: jest.fn(),
                count: jest.fn(),
                groupBy: jest.fn()
            },
            project: {
                findUnique: jest.fn(),
                findMany: jest.fn()
            },
            tag: {
                findUnique: jest.fn(),
                findMany: jest.fn()
            }
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectTagService,
                {
                    provide: PrismaService,
                    useValue: mockPrisma
                }
            ]
        }).compile();

        service = module.get<ProjectTagService>(ProjectTagService);
        mockPrismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAssociation', () => {
        const createDto: CreateProjectTagDto = {
            projectId: 'test-project-id',
            tagId: 'test-tag-id'
        };

        it('should create association successfully', async () => {
            (
                mockPrismaService.projectTag.findFirst as jest.Mock
            ).mockResolvedValue(null);
            (
                mockPrismaService.project.findUnique as jest.Mock
            ).mockResolvedValue(mockProject);
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                mockTag
            );
            (
                mockPrismaService.projectTag.create as jest.Mock
            ).mockResolvedValue(mockProjectTag);

            const result = await service.createAssociation(createDto);

            expect(mockPrismaService.projectTag.findFirst).toHaveBeenCalledWith(
                {
                    where: {
                        projectId: 'test-project-id',
                        tagId: 'test-tag-id'
                    }
                }
            );
            expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-project-id' }
            });
            expect(mockPrismaService.tag.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-tag-id' }
            });
            expect(mockPrismaService.projectTag.create).toHaveBeenCalledWith({
                data: createDto
            });
            expect(result).toEqual(mockProjectTag);
        });

        it('should throw ConflictException when association already exists', async () => {
            (
                mockPrismaService.projectTag.findFirst as jest.Mock
            ).mockResolvedValue(mockProjectTag);

            await expect(service.createAssociation(createDto)).rejects.toThrow(
                ConflictException
            );
        });

        it('should throw NotFoundException when project not found', async () => {
            (
                mockPrismaService.projectTag.findFirst as jest.Mock
            ).mockResolvedValue(null);
            (
                mockPrismaService.project.findUnique as jest.Mock
            ).mockResolvedValue(null);

            await expect(service.createAssociation(createDto)).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw NotFoundException when tag not found', async () => {
            (
                mockPrismaService.projectTag.findFirst as jest.Mock
            ).mockResolvedValue(null);
            (
                mockPrismaService.project.findUnique as jest.Mock
            ).mockResolvedValue(mockProject);
            (mockPrismaService.tag.findUnique as jest.Mock).mockResolvedValue(
                null
            );

            await expect(service.createAssociation(createDto)).rejects.toThrow(
                NotFoundException
            );
        });
    });

    describe('addMultipleTagsToProject', () => {
        it('should add multiple tags to project successfully', async () => {
            const tagIds = ['tag1', 'tag2', 'tag3'];
            (
                mockPrismaService.project.findUnique as jest.Mock
            ).mockResolvedValue(mockProject);
            (mockPrismaService.tag.findMany as jest.Mock).mockResolvedValue([
                { id: 'tag1' },
                { id: 'tag2' },
                { id: 'tag3' }
            ]);
            (mockPrismaService.projectTag.findFirst as jest.Mock)
                .mockResolvedValueOnce(null) // Premier tag n'existe pas
                .mockResolvedValueOnce(null) // Deuxième tag n'existe pas
                .mockResolvedValueOnce(null); // Troisième tag n'existe pas
            (mockPrismaService.projectTag.create as jest.Mock)
                .mockResolvedValueOnce({ ...mockProjectTag, tagId: 'tag1' })
                .mockResolvedValueOnce({ ...mockProjectTag, tagId: 'tag2' })
                .mockResolvedValueOnce({ ...mockProjectTag, tagId: 'tag3' });

            const result = await service.addMultipleTagsToProject(
                'test-project-id',
                tagIds
            );

            expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-project-id' }
            });
            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: { id: { in: tagIds } }
            });
            expect(result).toHaveLength(3);
        });

        it('should throw NotFoundException when project not found', async () => {
            (
                mockPrismaService.project.findUnique as jest.Mock
            ).mockResolvedValue(null);

            await expect(
                service.addMultipleTagsToProject('test-project-id', ['tag1'])
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByProject', () => {
        it('should return associations for a project', async () => {
            (
                mockPrismaService.projectTag.findMany as jest.Mock
            ).mockResolvedValue([mockProjectTag]);

            const result = await service.findByProject('test-project-id');

            expect(mockPrismaService.projectTag.findMany).toHaveBeenCalledWith({
                where: { projectId: 'test-project-id' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual([mockProjectTag]);
        });
    });

    describe('findByTag', () => {
        it('should return associations for a tag', async () => {
            (
                mockPrismaService.projectTag.findMany as jest.Mock
            ).mockResolvedValue([mockProjectTag]);

            const result = await service.findByTag('test-tag-id');

            expect(mockPrismaService.projectTag.findMany).toHaveBeenCalledWith({
                where: { tagId: 'test-tag-id' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toEqual([mockProjectTag]);
        });
    });

    describe('removeAssociation', () => {
        it('should remove association successfully', async () => {
            (
                mockPrismaService.projectTag.findFirst as jest.Mock
            ).mockResolvedValue(mockProjectTag);
            (
                mockPrismaService.projectTag.delete as jest.Mock
            ).mockResolvedValue(mockProjectTag);

            const result = await service.removeAssociation(
                'test-project-id',
                'test-tag-id'
            );

            expect(mockPrismaService.projectTag.findFirst).toHaveBeenCalledWith(
                {
                    where: {
                        projectId: 'test-project-id',
                        tagId: 'test-tag-id'
                    }
                }
            );
            expect(mockPrismaService.projectTag.delete).toHaveBeenCalledWith({
                where: { id: 'test-association-id' }
            });
            expect(result).toEqual(mockProjectTag);
        });

        it('should throw NotFoundException when association not found', async () => {
            (
                mockPrismaService.projectTag.findFirst as jest.Mock
            ).mockResolvedValue(null);

            await expect(
                service.removeAssociation('test-project-id', 'test-tag-id')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('countByProject', () => {
        it('should return count of associations for a project', async () => {
            (mockPrismaService.projectTag.count as jest.Mock).mockResolvedValue(
                5
            );

            const result = await service.countByProject('test-project-id');

            expect(mockPrismaService.projectTag.count).toHaveBeenCalledWith({
                where: { projectId: 'test-project-id' }
            });
            expect(result).toBe(5);
        });
    });

    describe('countByTag', () => {
        it('should return count of associations for a tag', async () => {
            (mockPrismaService.projectTag.count as jest.Mock).mockResolvedValue(
                3
            );

            const result = await service.countByTag('test-tag-id');

            expect(mockPrismaService.projectTag.count).toHaveBeenCalledWith({
                where: { tagId: 'test-tag-id' }
            });
            expect(result).toBe(3);
        });
    });

    describe('findPopularTags', () => {
        it('should return popular tags with project counts', async () => {
            const mockGroupBy = [
                { tagId: 'tag1', _count: { projectId: 10 } },
                { tagId: 'tag2', _count: { projectId: 8 } }
            ];
            const mockTags = [
                { id: 'tag1', name: 'Tag 1' },
                { id: 'tag2', name: 'Tag 2' }
            ];
            (
                mockPrismaService.projectTag.groupBy as jest.Mock
            ).mockResolvedValue(mockGroupBy);
            (mockPrismaService.tag.findMany as jest.Mock).mockResolvedValue(
                mockTags
            );

            const result = await service.findPopularTags(10);

            expect(mockPrismaService.projectTag.groupBy).toHaveBeenCalledWith({
                by: ['tagId'],
                _count: { projectId: true },
                orderBy: { _count: { projectId: 'desc' } },
                take: 10
            });
            expect(mockPrismaService.tag.findMany).toHaveBeenCalledWith({
                where: { id: { in: ['tag1', 'tag2'] } }
            });
            expect(result).toEqual([
                { id: 'tag1', name: 'Tag 1', projectCount: 10 },
                { id: 'tag2', name: 'Tag 2', projectCount: 8 }
            ]);
        });
    });

    describe('findSimilarProjects', () => {
        it('should return similar projects based on shared tags', async () => {
            const mockProjectTags = [
                { tagId: 'tag1', projectId: 'test-project-id' },
                { tagId: 'tag2', projectId: 'test-project-id' }
            ];
            const mockSimilarProjects = [
                {
                    projectId: 'similar-project-1',
                    tagId: 'tag1',
                    project: {
                        id: 'similar-project-1',
                        title: 'Similar Project 1'
                    }
                },
                {
                    projectId: 'similar-project-2',
                    tagId: 'tag2',
                    project: {
                        id: 'similar-project-2',
                        title: 'Similar Project 2'
                    }
                }
            ];

            (mockPrismaService.projectTag.findMany as jest.Mock)
                .mockResolvedValueOnce(mockProjectTags) // Premier appel pour findByProject
                .mockResolvedValueOnce(mockSimilarProjects); // Deuxième appel pour findSimilarProjects

            const result = await service.findSimilarProjects(
                'test-project-id',
                5
            );

            expect(mockPrismaService.projectTag.findMany).toHaveBeenCalledWith({
                where: { projectId: 'test-project-id' },
                orderBy: { createdAt: 'desc' }
            });
            expect(mockPrismaService.projectTag.findMany).toHaveBeenCalledWith({
                where: {
                    tagId: { in: ['tag1', 'tag2'] },
                    projectId: { not: 'test-project-id' }
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            status: true,
                            logoImage: true,
                            projectStage: true,
                            financialGoal: true,
                            nbLikes: true,
                            nbViews: true,
                            verifiedProject: true,
                            createdAt: true,
                            creator: {
                                select: {
                                    id: true,
                                    name: true,
                                    profilePicture: true
                                }
                            }
                        }
                    }
                },
                take: 10
            });
            expect(result).toHaveLength(2);
        });
    });
});
