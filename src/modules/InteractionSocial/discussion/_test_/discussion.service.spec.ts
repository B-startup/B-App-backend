import { Test, TestingModule } from '@nestjs/testing';
import { DiscussionService } from '../discussion.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { DiscussionType } from '@prisma/client';

describe('DiscussionService', () => {
    let service: DiscussionService;
    let prismaService: PrismaService;

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

    const mockUser1 = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: 'john.jpg'
    };

    const mockUser2 = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        profilePicture: 'jane.jpg'
    };

    const mockProject = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        title: 'Test Project',
        description: 'Test project description'
    };

    const mockDiscussion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        senderId: mockUser1.id,
        receiverId: mockUser2.id,
        type: DiscussionType.PRIVATE,
        projectId: null,
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
        updatedAt: new Date('2023-12-01T10:00:00.000Z'),
        sender: mockUser1,
        receiver: mockUser2,
        project: null,
        messages: [],
        _count: { messages: 0 }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DiscussionService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<DiscussionService>(DiscussionService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createDiscussion', () => {
        it('should create a private discussion successfully', async () => {
            const createDiscussionDto = {
                receiverId: mockUser2.id,
                type: DiscussionType.PRIVATE
            };

            mockPrismaService.discussion.findFirst.mockResolvedValue(null);
            mockPrismaService.discussion.create.mockResolvedValue(mockDiscussion);

            const result = await service.createDiscussion(mockUser1.id, createDiscussionDto);

            expect(mockPrismaService.discussion.findFirst).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { senderId: mockUser1.id, receiverId: mockUser2.id, type: DiscussionType.PRIVATE, projectId: undefined },
                        { senderId: mockUser2.id, receiverId: mockUser1.id, type: DiscussionType.PRIVATE, projectId: undefined }
                    ]
                }
            });

            expect(mockPrismaService.discussion.create).toHaveBeenCalledWith({
                data: {
                    senderId: mockUser1.id,
                    receiverId: mockUser2.id,
                    type: DiscussionType.PRIVATE,
                    projectId: undefined
                },
                include: expect.any(Object)
            });

            expect(result).toEqual({
                id: mockDiscussion.id,
                senderId: mockDiscussion.senderId,
                receiverId: mockDiscussion.receiverId,
                type: mockDiscussion.type,
                projectId: mockDiscussion.projectId,
                createdAt: mockDiscussion.createdAt,
                updatedAt: mockDiscussion.updatedAt,
                sender: mockDiscussion.sender,
                receiver: mockDiscussion.receiver,
                project: mockDiscussion.project,
                lastMessage: undefined,
                messageCount: 0
            });
        });

        it('should create a project discussion successfully', async () => {
            const createDiscussionDto = {
                receiverId: mockUser2.id,
                type: DiscussionType.PROJECT,
                projectId: mockProject.id
            };

            const projectDiscussion = {
                ...mockDiscussion,
                type: DiscussionType.PROJECT,
                projectId: mockProject.id,
                project: mockProject
            };

            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
            mockPrismaService.discussion.findFirst.mockResolvedValue(null);
            mockPrismaService.discussion.create.mockResolvedValue(projectDiscussion);

            const result = await service.createDiscussion(mockUser1.id, createDiscussionDto);

            expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
                where: { id: mockProject.id }
            });

            expect(result.type).toBe(DiscussionType.PROJECT);
            expect(result.projectId).toBe(mockProject.id);
            expect(result.project).toEqual(mockProject);
        });

        it('should throw BadRequestException when user tries to create discussion with themselves', async () => {
            const createDiscussionDto = {
                receiverId: mockUser1.id,
                type: DiscussionType.PRIVATE
            };

            await expect(
                service.createDiscussion(mockUser1.id, createDiscussionDto)
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException when project does not exist for project discussion', async () => {
            const createDiscussionDto = {
                receiverId: mockUser2.id,
                type: DiscussionType.PROJECT,
                projectId: 'non-existent-project-id'
            };

            mockPrismaService.project.findUnique.mockResolvedValue(null);

            await expect(
                service.createDiscussion(mockUser1.id, createDiscussionDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when discussion already exists', async () => {
            const createDiscussionDto = {
                receiverId: mockUser2.id,
                type: DiscussionType.PRIVATE
            };

            mockPrismaService.discussion.findFirst.mockResolvedValue(mockDiscussion);

            await expect(
                service.createDiscussion(mockUser1.id, createDiscussionDto)
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('getUserDiscussions', () => {
        it('should return user discussions successfully', async () => {
            const discussions = [mockDiscussion];
            mockPrismaService.discussion.findMany.mockResolvedValue(discussions);

            const result = await service.getUserDiscussions(mockUser1.id);

            expect(mockPrismaService.discussion.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { senderId: mockUser1.id },
                        { receiverId: mockUser1.id }
                    ]
                },
                include: expect.any(Object),
                orderBy: { updatedAt: 'desc' }
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(expect.objectContaining({
                id: mockDiscussion.id,
                senderId: mockDiscussion.senderId,
                receiverId: mockDiscussion.receiverId
            }));
        });
    });

    describe('getDiscussionById', () => {
        it('should return discussion by ID successfully', async () => {
            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);

            const result = await service.getDiscussionById(mockDiscussion.id, mockUser1.id);

            expect(mockPrismaService.discussion.findUnique).toHaveBeenCalledWith({
                where: { id: mockDiscussion.id },
                include: expect.any(Object)
            });

            expect(result).toEqual(expect.objectContaining({
                id: mockDiscussion.id,
                senderId: mockDiscussion.senderId,
                receiverId: mockDiscussion.receiverId
            }));
        });

        it('should throw NotFoundException when discussion does not exist', async () => {
            mockPrismaService.discussion.findUnique.mockResolvedValue(null);

            await expect(
                service.getDiscussionById('non-existent-id', mockUser1.id)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not participant', async () => {
            const unauthorizedUserId = 'unauthorized-user-id';
            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);

            await expect(
                service.getDiscussionById(mockDiscussion.id, unauthorizedUserId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deleteDiscussion', () => {
        it('should delete discussion successfully', async () => {
            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);
            mockPrismaService.discussion.delete.mockResolvedValue(mockDiscussion);

            await service.deleteDiscussion(mockDiscussion.id, mockUser1.id);

            expect(mockPrismaService.discussion.delete).toHaveBeenCalledWith({
                where: { id: mockDiscussion.id }
            });
        });

        it('should throw NotFoundException when discussion does not exist', async () => {
            mockPrismaService.discussion.findUnique.mockResolvedValue(null);

            await expect(
                service.deleteDiscussion('non-existent-id', mockUser1.id)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not the sender', async () => {
            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);

            await expect(
                service.deleteDiscussion(mockDiscussion.id, mockUser2.id)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getProjectDiscussions', () => {
        it('should return project discussions successfully', async () => {
            const projectDiscussions = [{
                ...mockDiscussion,
                type: DiscussionType.PROJECT,
                projectId: mockProject.id,
                project: mockProject
            }];

            mockPrismaService.discussion.findMany.mockResolvedValue(projectDiscussions);

            const result = await service.getProjectDiscussions(mockProject.id);

            expect(mockPrismaService.discussion.findMany).toHaveBeenCalledWith({
                where: {
                    projectId: mockProject.id,
                    type: DiscussionType.PROJECT
                },
                include: expect.any(Object),
                orderBy: { updatedAt: 'desc' }
            });

            expect(result).toHaveLength(1);
            expect(result[0].type).toBe(DiscussionType.PROJECT);
            expect(result[0].projectId).toBe(mockProject.id);
        });
    });

    describe('searchDiscussions', () => {
        it('should search discussions successfully', async () => {
            const discussions = [mockDiscussion];
            mockPrismaService.discussion.findMany.mockResolvedValue(discussions);

            const result = await service.searchDiscussions(mockUser1.id, 'John');

            expect(mockPrismaService.discussion.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { senderId: mockUser1.id },
                        { receiverId: mockUser1.id }
                    ],
                    AND: {
                        OR: expect.any(Array)
                    }
                },
                include: expect.any(Object),
                orderBy: { updatedAt: 'desc' }
            });

            expect(result).toHaveLength(1);
        });
    });
});
