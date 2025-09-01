import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { PrismaService } from '../../../core/services/prisma.service';
import { 
    CreateNotificationDto, 
    UpdateNotificationDto, 
    NotificationResponseDto,
    MarkAllReadResponseDto,
    NotificationListDto
} from './dto';

@Injectable()
export class NotificationService extends BaseCrudServiceImpl<
    Notification,
    CreateNotificationDto,
    UpdateNotificationDto
> {
    protected model = this.prismaService.notification;

    constructor(private readonly prismaService: PrismaService) {
        super(prismaService);
    }

    /**
     * Create notification with business logic
     */
    async createNotification(createDto: CreateNotificationDto): Promise<NotificationResponseDto> {
        const notification = await this.create(createDto);
        return this.toNotificationResponseDto(notification);
    }

    /**
     * Find user notifications optimized - Direct Prisma selection
     */
    async findUserNotifications(userId: string): Promise<NotificationListDto[]> {
        return this.model.findMany({
            where: { userId },
            select: {
                id: true,
                userId: true,
                type: true,
                Title: true,
                message: true,
                isRead: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limite pour performance
        });
    }

    /**
     * Find unread notifications optimized - Direct Prisma selection
     */
    async findUnreadNotifications(userId: string): Promise<NotificationListDto[]> {
        return this.model.findMany({
            where: { 
                userId,
                isRead: false 
            },
            select: {
                id: true,
                userId: true,
                type: true,
                Title: true,
                message: true,
                isRead: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Limite pour performance
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id: string): Promise<NotificationResponseDto> {
        const notification = await this.model.update({
            where: { id },
            data: { isRead: true }
        });

        return this.toNotificationResponseDto(notification);
    }

    /**
     * Mark all user notifications as read
     */
    async markAllAsRead(userId: string): Promise<MarkAllReadResponseDto> {
        const result = await this.model.updateMany({
            where: { 
                userId,
                isRead: false 
            },
            data: { isRead: true }
        });

        return { updated: result.count };
    }

    /**
     * Convert to NotificationResponseDto
     */
    private toNotificationResponseDto(notification: any): NotificationResponseDto {
        return {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            Title: notification.Title,
            message: notification.message,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            user: notification.user
        };
    }
}
