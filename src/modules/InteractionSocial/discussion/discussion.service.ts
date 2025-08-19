import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Discussion, DiscussionType } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { PrismaService } from '../../../core/services/prisma.service';
import { CreateDiscussionDto, UpdateDiscussionDto, DiscussionResponseDto } from './dto';

@Injectable()
export class DiscussionService extends BaseCrudServiceImpl<Discussion, CreateDiscussionDto, UpdateDiscussionDto> {
    protected model: any;

    constructor(protected readonly prisma: PrismaService) {
        super(prisma);
        this.model = prisma.discussion;
    }

    /**
     * Create a new discussion between users
     */
    async createDiscussion(senderId: string, createDiscussionDto: CreateDiscussionDto): Promise<DiscussionResponseDto> {
        const { receiverId, type, projectId } = createDiscussionDto;

        // Validation: user cannot create discussion with themselves
        if (senderId === receiverId) {
            throw new BadRequestException('Cannot create discussion with yourself');
        }

        // Validate project exists if type is PROJECT
        if (type === DiscussionType.PROJECT && projectId) {
            const project = await this.prisma.project.findUnique({
                where: { id: projectId }
            });
            if (!project) {
                throw new NotFoundException('Project not found');
            }
        }

        // Check if discussion already exists between these users
        const existingDiscussion = await this.model.findFirst({
            where: {
                OR: [
                    { senderId, receiverId, type, projectId },
                    { senderId: receiverId, receiverId: senderId, type, projectId }
                ]
            }
        });

        if (existingDiscussion) {
            throw new BadRequestException('Discussion already exists between these users');
        }

        // Create the discussion
        const discussion = await this.model.create({
            data: {
                senderId,
                receiverId,
                type,
                projectId
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
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                project: projectId ? {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                } : undefined
            }
        });

        return this.toDiscussionResponseDto(discussion);
    }

    /**
     * Get all discussions for a specific user
     */
    async getUserDiscussions(userId: string): Promise<DiscussionResponseDto[]> {
        const discussions = await this.model.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
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
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return discussions.map(discussion => this.toDiscussionResponseDto(discussion));
    }

    /**
     * Get a specific discussion by ID
     */
    async getDiscussionById(discussionId: string, userId: string): Promise<DiscussionResponseDto> {
        const discussion = await this.model.findUnique({
            where: { id: discussionId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            }
        });

        if (!discussion) {
            throw new NotFoundException('Discussion not found');
        }

        // Check if user is participant in the discussion
        if (discussion.senderId !== userId && discussion.receiverId !== userId) {
            throw new ForbiddenException('You are not authorized to access this discussion');
        }

        return this.toDiscussionResponseDto(discussion);
    }

    /**
     * Delete a discussion
     */
    async deleteDiscussion(discussionId: string, userId: string): Promise<void> {
        const discussion = await this.model.findUnique({
            where: { id: discussionId }
        });

        if (!discussion) {
            throw new NotFoundException('Discussion not found');
        }

        // Only the sender can delete the discussion
        if (discussion.senderId !== userId) {
            throw new ForbiddenException('Only the discussion initiator can delete it');
        }

        await this.model.delete({
            where: { id: discussionId }
        });
    }

    /**
     * Get discussions by project
     */
    async getProjectDiscussions(projectId: string): Promise<DiscussionResponseDto[]> {
        const discussions = await this.model.findMany({
            where: {
                projectId,
                type: DiscussionType.PROJECT
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
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return discussions.map(discussion => this.toDiscussionResponseDto(discussion));
    }

    /**
     * Search discussions by user name or project title
     */
    async searchDiscussions(userId: string, query: string): Promise<DiscussionResponseDto[]> {
        const discussions = await this.model.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                AND: {
                    OR: [
                        {
                            sender: {
                                name: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        },
                        {
                            receiver: {
                                name: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        },
                        {
                            project: {
                                title: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        }
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
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profilePicture: true
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return discussions.map(discussion => this.toDiscussionResponseDto(discussion));
    }

    /**
     * Convert discussion entity to response DTO
     */
    private toDiscussionResponseDto(discussion: any): DiscussionResponseDto {
        return {
            id: discussion.id,
            senderId: discussion.senderId,
            receiverId: discussion.receiverId,
            type: discussion.type,
            projectId: discussion.projectId,
            createdAt: discussion.createdAt,
            updatedAt: discussion.updatedAt,
            sender: discussion.sender,
            receiver: discussion.receiver,
            project: discussion.project,
            lastMessage: discussion.messages?.[0],
            messageCount: discussion._count?.messages
        };
    }
}
