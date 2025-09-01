import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
    @ApiProperty({ description: 'Notification ID' })
    id: string;

    @ApiProperty({ description: 'User ID who receives the notification' })
    userId: string;

    @ApiProperty({ 
        enum: NotificationType,
        description: 'Type of notification' 
    })
    type: NotificationType;

    @ApiProperty({ description: 'Notification title', required: false })
    Title?: string;

    @ApiProperty({ description: 'Notification message' })
    message: string;

    @ApiProperty({ description: 'Whether notification is read' })
    isRead: boolean;

    @ApiProperty({ description: 'Additional metadata', required: false })
    metadata?: any;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    @ApiProperty({ description: 'User information', required: false })
    user?: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
}
