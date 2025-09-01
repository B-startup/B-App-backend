import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @ApiProperty({
        description: 'ID of the user who will receive the notification',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    userId: string;

    @ApiProperty({
        enum: NotificationType,
        description: 'Type of the notification',
        example: NotificationType.NEW_LIKE,
        enumName: 'NotificationType'
    })
    @IsNotEmpty()
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({
        description: 'Optional title for the notification',
        example: 'New Like on Your Project',
        required: false
    })
    @IsOptional()
    @IsString()
    Title?: string;

    @ApiProperty({
        description: 'Main content of the notification message',
        example: 'John Doe liked your project "FinTech Startup"'
    })
    @IsNotEmpty()
    @IsString()
    message: string;

    @ApiProperty({
        description: 'Whether the notification should be marked as read initially',
        example: false,
        default: false,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean = false;
}
