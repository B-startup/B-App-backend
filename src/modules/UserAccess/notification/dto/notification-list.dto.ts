import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationStatsDto {
    @ApiProperty({
        description: 'Total number of notifications for the user',
        example: 25
    })
    total: number;

    @ApiProperty({
        description: 'Number of unread notifications',
        example: 3
    })
    unread: number;

    @ApiProperty({
        description: 'Number of read notifications',
        example: 22
    })
    read: number;

    @ApiProperty({
        description: 'Breakdown by notification type',
        example: {
            NEW_LIKE: 10,
            NEW_COMMENT: 5,
            NEW_FOLLOWER: 3,
            PROJECT_UPDATE: 2,
            OTHER: 5
        }
    })
    byType: Record<string, number>;
}

export class NotificationListDto {
    @ApiProperty({
        description: 'Notification ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'User ID who receives the notification',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    userId: string;

    @ApiProperty({
        enum: NotificationType,
        description: 'Type of notification',
        example: NotificationType.NEW_LIKE,
        enumName: 'NotificationType'
    })
    type: NotificationType;

    @ApiProperty({
        description: 'Notification title',
        example: 'New Like on Your Project',
        required: false
    })
    Title?: string;

    @ApiProperty({
        description: 'Notification message',
        example: 'John Doe liked your project "FinTech Startup"'
    })
    message: string;

    @ApiProperty({
        description: 'Whether notification is read',
        example: false
    })
    isRead: boolean;

    @ApiProperty({
        description: 'Creation date',
        example: '2025-09-01T10:30:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update date',
        example: '2025-09-01T10:30:00.000Z'
    })
    updatedAt: Date;
}
