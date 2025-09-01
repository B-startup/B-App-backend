import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { NotificationType } from '@prisma/client';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
    @ApiProperty({
        enum: NotificationType,
        description: 'Update the type of the notification',
        example: NotificationType.NEW_FOLLOWER,
        required: false,
        enumName: 'NotificationType'
    })
    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @ApiProperty({
        description: 'Update the title of the notification',
        example: 'Updated: New Like on Your Project',
        required: false
    })
    @IsOptional()
    @IsString()
    Title?: string;

    @ApiProperty({
        description: 'Update the message content',
        example: 'Jane Smith and 2 others liked your project "FinTech Startup"',
        required: false
    })
    @IsOptional()
    @IsString()
    message?: string;

    @ApiProperty({
        description: 'Update the read status of the notification',
        example: true,
        required: false
    })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean;
}
