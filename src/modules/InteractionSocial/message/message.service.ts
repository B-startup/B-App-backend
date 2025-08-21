import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { PrismaService } from '../../../core/services/prisma.service';
import { CreateMessageDto, UpdateMessageDto, MessageResponseDto } from './dto';

@Injectable()
export class MessageService extends BaseCrudServiceImpl<Message, CreateMessageDto, UpdateMessageDto> {
    protected model: any;

    constructor(protected readonly prisma: PrismaService) {
        super(prisma);
        this.model = prisma.message;
    }

    /**
     * Send a new message in a discussion
     */
    async sendMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<MessageResponseDto> {
        const { discussionId, content } = createMessageDto;

        // Verify discussion exists and user is participant
        const discussion = await this.prisma.discussion.findUnique({
            where: { id: discussionId },
            include: {
                sender: true,
                receiver: true
            }
        });

        if (!discussion) {
            throw new NotFoundException('Discussion not found');
        }

        // Check if user is participant in the discussion
        if (discussion.senderId !== senderId && discussion.receiverId !== senderId) {
            throw new ForbiddenException('You are not authorized to send messages in this discussion');
        }

        // Create the message
        const message = await this.model.create({
            data: {
                discussionId,
                senderId,
                content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                discussion: {
                    select: {
                        id: true,
                        type: true,
                        senderId: true,
                        receiverId: true,
                        projectId: true
                    }
                }
            }
        });

        // Update discussion's updatedAt timestamp
        await this.prisma.discussion.update({
            where: { id: discussionId },
            data: { updatedAt: new Date() }
        });

        return this.toMessageResponseDto(message);
    }

    /**
     * Get all messages in a discussion
     */
    async getDiscussionMessages(discussionId: string, userId: string, page = 1, limit = 50): Promise<{
        messages: MessageResponseDto[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        // Verify discussion exists and user is participant
        const discussion = await this.prisma.discussion.findUnique({
            where: { id: discussionId }
        });

        if (!discussion) {
            throw new NotFoundException('Discussion not found');
        }

        // Check if user is participant in the discussion
        if (discussion.senderId !== userId && discussion.receiverId !== userId) {
            throw new ForbiddenException('You are not authorized to access messages in this discussion');
        }

        const skip = (page - 1) * limit;

        // Get total count
        const total = await this.model.count({
            where: { discussionId }
        });

        // Get messages with pagination
        const messages = await this.model.findMany({
            where: { discussionId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                discussion: {
                    select: {
                        id: true,
                        type: true,
                        senderId: true,
                        receiverId: true,
                        projectId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        return {
            messages: messages.map(message => this.toMessageResponseDto(message)),
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };
    }

    /**
     * Update a message (only sender can update)
     */
    async updateMessage(messageId: string, userId: string, updateMessageDto: UpdateMessageDto): Promise<MessageResponseDto> {
        const message = await this.model.findUnique({
            where: { id: messageId },
            include: {
                sender: true,
                discussion: true
            }
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        // Only sender can update the message
        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only update your own messages');
        }

        // Update the message
        const updatedMessage = await this.model.update({
            where: { id: messageId },
            data: updateMessageDto,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                discussion: {
                    select: {
                        id: true,
                        type: true,
                        senderId: true,
                        receiverId: true,
                        projectId: true
                    }
                }
            }
        });

        return this.toMessageResponseDto(updatedMessage);
    }

    /**
     * Delete a message (only sender can delete)
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await this.model.findUnique({
            where: { id: messageId }
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        // Only sender can delete the message
        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only delete your own messages');
        }

        await this.model.delete({
            where: { id: messageId }
        });
    }

    /**
     * Get a specific message by ID
     */
    async getMessageById(messageId: string, userId: string): Promise<MessageResponseDto> {
        const message = await this.model.findUnique({
            where: { id: messageId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                discussion: {
                    select: {
                        id: true,
                        type: true,
                        senderId: true,
                        receiverId: true,
                        projectId: true
                    }
                }
            }
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        // Check if user is participant in the discussion
        if (message.discussion.senderId !== userId && message.discussion.receiverId !== userId) {
            throw new ForbiddenException('You are not authorized to access this message');
        }

        return this.toMessageResponseDto(message);
    }

    /**
     * Search messages in a discussion
     */
    async searchMessages(discussionId: string, userId: string, query: string): Promise<MessageResponseDto[]> {
        // Verify discussion exists and user is participant
        const discussion = await this.prisma.discussion.findUnique({
            where: { id: discussionId }
        });

        if (!discussion) {
            throw new NotFoundException('Discussion not found');
        }

        // Check if user is participant in the discussion
        if (discussion.senderId !== userId && discussion.receiverId !== userId) {
            throw new ForbiddenException('You are not authorized to search messages in this discussion');
        }

        const messages = await this.model.findMany({
            where: {
                discussionId,
                content: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                discussion: {
                    select: {
                        id: true,
                        type: true,
                        senderId: true,
                        receiverId: true,
                        projectId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return messages.map(message => this.toMessageResponseDto(message));
    }

    /**
     * Get user's recent messages across all discussions
     */
    async getUserRecentMessages(userId: string, limit = 20): Promise<MessageResponseDto[]> {
        const messages = await this.model.findMany({
            where: {
                discussion: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId }
                    ]
                }
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                discussion: {
                    select: {
                        id: true,
                        type: true,
                        senderId: true,
                        receiverId: true,
                        projectId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return messages.map(message => this.toMessageResponseDto(message));
    }

    /**
     * Convert message entity to response DTO
     */
    private toMessageResponseDto(message: any): MessageResponseDto {
        return {
            id: message.id,
            discussionId: message.discussionId,
            senderId: message.senderId,
            content: message.content,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            sender: message.sender,
            discussion: message.discussion
        };
    }
}
