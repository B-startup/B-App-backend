import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from '../message.service';
import { PrismaService } from '../../../../core/services/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DiscussionType } from '@prisma/client';

describe('MessageService', () => {
    let service: MessageService;
    let prismaService: PrismaService;

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

    const mockDiscussion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        senderId: mockUser1.id,
        receiverId: mockUser2.id,
        type: DiscussionType.PRIVATE,
        projectId: null,
        sender: mockUser1,
        receiver: mockUser2
    };

    const mockMessage = {
        id: '123e4567-e89b-12d3-a456-426614174100',
        discussionId: mockDiscussion.id,
        senderId: mockUser1.id,
        content: 'Hello, how are you?',
        createdAt: new Date('2023-12-01T10:00:00.000Z'),
        updatedAt: new Date('2023-12-01T10:00:00.000Z'),
        sender: mockUser1,
        discussion: {
            id: mockDiscussion.id,
            type: mockDiscussion.type,
            senderId: mockDiscussion.senderId,
            receiverId: mockDiscussion.receiverId,
            projectId: mockDiscussion.projectId
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MessageService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<MessageService>(MessageService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const createMessageDto = {
                discussionId: mockDiscussion.id,
                content: 'Hello, how are you?'
            };

            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);
            mockPrismaService.message.create.mockResolvedValue(mockMessage);
            mockPrismaService.discussion.update.mockResolvedValue(mockDiscussion);

            const result = await service.sendMessage(mockUser1.id, createMessageDto);

            expect(mockPrismaService.discussion.findUnique).toHaveBeenCalledWith({
                where: { id: mockDiscussion.id },
                include: {
                    sender: true,
                    receiver: true
                }
            });

            expect(mockPrismaService.message.create).toHaveBeenCalledWith({
                data: {
                    discussionId: mockDiscussion.id,
                    senderId: mockUser1.id,
                    content: 'Hello, how are you?'
                },
                include: expect.any(Object)
            });

            expect(mockPrismaService.discussion.update).toHaveBeenCalledWith({
                where: { id: mockDiscussion.id },
                data: { updatedAt: expect.any(Date) }
            });

            expect(result).toEqual({
                id: mockMessage.id,
                discussionId: mockMessage.discussionId,
                senderId: mockMessage.senderId,
                content: mockMessage.content,
                createdAt: mockMessage.createdAt,
                updatedAt: mockMessage.updatedAt,
                sender: mockMessage.sender,
                discussion: mockMessage.discussion
            });
        });

        it('should throw NotFoundException when discussion does not exist', async () => {
            const createMessageDto = {
                discussionId: 'non-existent-discussion-id',
                content: 'Hello, how are you?'
            };

            mockPrismaService.discussion.findUnique.mockResolvedValue(null);

            await expect(
                service.sendMessage(mockUser1.id, createMessageDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not participant in discussion', async () => {
            const createMessageDto = {
                discussionId: mockDiscussion.id,
                content: 'Hello, how are you?'
            };

            const unauthorizedUserId = 'unauthorized-user-id';
            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);

            await expect(
                service.sendMessage(unauthorizedUserId, createMessageDto)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getDiscussionMessages', () => {
        it('should return paginated messages successfully', async () => {
            const messages = [mockMessage];
            const totalCount = 10;

            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);
            mockPrismaService.message.count.mockResolvedValue(totalCount);
            mockPrismaService.message.findMany.mockResolvedValue(messages);

            const result = await service.getDiscussionMessages(mockDiscussion.id, mockUser1.id, 1, 5);

            expect(mockPrismaService.discussion.findUnique).toHaveBeenCalledWith({
                where: { id: mockDiscussion.id }
            });

            expect(mockPrismaService.message.count).toHaveBeenCalledWith({
                where: { discussionId: mockDiscussion.id }
            });

            expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
                where: { discussionId: mockDiscussion.id },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: 5
            });

            expect(result).toEqual({
                messages: expect.any(Array),
                pagination: {
                    page: 1,
                    limit: 5,
                    total: totalCount,
                    totalPages: 2
                }
            });
        });

        it('should throw NotFoundException when discussion does not exist', async () => {
            mockPrismaService.discussion.findUnique.mockResolvedValue(null);

            await expect(
                service.getDiscussionMessages('non-existent-discussion-id', mockUser1.id)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not participant in discussion', async () => {
            const unauthorizedUserId = 'unauthorized-user-id';
            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);

            await expect(
                service.getDiscussionMessages(mockDiscussion.id, unauthorizedUserId)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('updateMessage', () => {
        it('should update message successfully', async () => {
            const updateMessageDto = {
                content: 'Updated message content'
            };

            const updatedMessage = {
                ...mockMessage,
                content: updateMessageDto.content,
                updatedAt: new Date()
            };

            mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
            mockPrismaService.message.update.mockResolvedValue(updatedMessage);

            const result = await service.updateMessage(mockMessage.id, mockUser1.id, updateMessageDto);

            expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
                where: { id: mockMessage.id },
                include: expect.any(Object)
            });

            expect(mockPrismaService.message.update).toHaveBeenCalledWith({
                where: { id: mockMessage.id },
                data: updateMessageDto,
                include: expect.any(Object)
            });

            expect(result.content).toBe(updateMessageDto.content);
        });

        it('should throw NotFoundException when message does not exist', async () => {
            const updateMessageDto = {
                content: 'Updated message content'
            };

            mockPrismaService.message.findUnique.mockResolvedValue(null);

            await expect(
                service.updateMessage('non-existent-message-id', mockUser1.id, updateMessageDto)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not the sender', async () => {
            const updateMessageDto = {
                content: 'Updated message content'
            };

            mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);

            await expect(
                service.updateMessage(mockMessage.id, mockUser2.id, updateMessageDto)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('deleteMessage', () => {
        it('should delete message successfully', async () => {
            mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);
            mockPrismaService.message.delete.mockResolvedValue(mockMessage);

            await service.deleteMessage(mockMessage.id, mockUser1.id);

            expect(mockPrismaService.message.delete).toHaveBeenCalledWith({
                where: { id: mockMessage.id }
            });
        });

        it('should throw NotFoundException when message does not exist', async () => {
            mockPrismaService.message.findUnique.mockResolvedValue(null);

            await expect(
                service.deleteMessage('non-existent-message-id', mockUser1.id)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not the sender', async () => {
            mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);

            await expect(
                service.deleteMessage(mockMessage.id, mockUser2.id)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('getMessageById', () => {
        it('should return message by ID successfully', async () => {
            mockPrismaService.message.findUnique.mockResolvedValue(mockMessage);

            const result = await service.getMessageById(mockMessage.id, mockUser1.id);

            expect(mockPrismaService.message.findUnique).toHaveBeenCalledWith({
                where: { id: mockMessage.id },
                include: expect.any(Object)
            });

            expect(result).toEqual({
                id: mockMessage.id,
                discussionId: mockMessage.discussionId,
                senderId: mockMessage.senderId,
                content: mockMessage.content,
                createdAt: mockMessage.createdAt,
                updatedAt: mockMessage.updatedAt,
                sender: mockMessage.sender,
                discussion: mockMessage.discussion
            });
        });

        it('should throw NotFoundException when message does not exist', async () => {
            mockPrismaService.message.findUnique.mockResolvedValue(null);

            await expect(
                service.getMessageById('non-existent-message-id', mockUser1.id)
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when user is not participant in discussion', async () => {
            const messageWithDifferentDiscussion = {
                ...mockMessage,
                discussion: {
                    ...mockMessage.discussion,
                    senderId: 'another-user-id',
                    receiverId: 'yet-another-user-id'
                }
            };

            mockPrismaService.message.findUnique.mockResolvedValue(messageWithDifferentDiscussion);

            await expect(
                service.getMessageById(mockMessage.id, mockUser1.id)
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('searchMessages', () => {
        it('should search messages successfully', async () => {
            const messages = [mockMessage];
            const query = 'hello';

            mockPrismaService.discussion.findUnique.mockResolvedValue(mockDiscussion);
            mockPrismaService.message.findMany.mockResolvedValue(messages);

            const result = await service.searchMessages(mockDiscussion.id, mockUser1.id, query);

            expect(mockPrismaService.discussion.findUnique).toHaveBeenCalledWith({
                where: { id: mockDiscussion.id }
            });

            expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
                where: {
                    discussionId: mockDiscussion.id,
                    content: {
                        contains: query,
                        mode: 'insensitive'
                    }
                },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' }
            });

            expect(result).toHaveLength(1);
        });
    });

    describe('getUserRecentMessages', () => {
        it('should return user recent messages successfully', async () => {
            const messages = [mockMessage];
            mockPrismaService.message.findMany.mockResolvedValue(messages);

            const result = await service.getUserRecentMessages(mockUser1.id, 10);

            expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
                where: {
                    discussion: {
                        OR: [
                            { senderId: mockUser1.id },
                            { receiverId: mockUser1.id }
                        ]
                    }
                },
                include: expect.any(Object),
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            expect(result).toHaveLength(1);
        });
    });
});
