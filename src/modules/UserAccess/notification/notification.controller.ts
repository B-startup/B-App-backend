import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Put
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { 
    CreateNotificationDto, 
    NotificationResponseDto, 
    NotificationListDto,
    MarkAllReadResponseDto 
} from './dto';

@ApiTags('Notification Management')
@ApiBearerAuth()
@TokenProtected()
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new notification' })
    @ApiResponse({ status: 201, description: 'Notification created successfully', type: NotificationResponseDto })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationService.createNotification(createNotificationDto);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get notifications for a specific user (optimized)' })
    @ApiParam({ name: 'userId', description: 'User ID to get notifications for' })
    @ApiResponse({ 
        status: 200, 
        description: 'User notifications retrieved successfully',
        type: [NotificationListDto]
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findByUser(@Param('userId') userId: string): Promise<NotificationListDto[]> {
        return this.notificationService.findUserNotifications(userId);
    }

    @Get('user/:userId/unread')
    @ApiOperation({ summary: 'Get unread notifications for a user (optimized)' })
    @ApiParam({ name: 'userId', description: 'User ID to get unread notifications for' })
    @ApiResponse({ 
        status: 200, 
        description: 'Unread notifications retrieved successfully',
        type: [NotificationListDto]
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findUnread(@Param('userId') userId: string): Promise<NotificationListDto[]> {
        return this.notificationService.findUnreadNotifications(userId);
    }

    @Put(':id/mark-read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiParam({ name: 'id', description: 'Notification ID' })
    @ApiResponse({ status: 200, description: 'Notification marked as read successfully', type: NotificationResponseDto })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    markAsRead(@Param('id') id: string) {
        return this.notificationService.markAsRead(id);
    }

    @Put('user/:userId/mark-all-read')
    @ApiOperation({ summary: 'Mark all user notifications as read' })
    @ApiParam({ name: 'userId', description: 'User ID to mark all notifications as read' })
    @ApiResponse({ 
        status: 200, 
        description: 'All notifications marked as read successfully',
        type: MarkAllReadResponseDto
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    markAllAsRead(@Param('userId') userId: string): Promise<MarkAllReadResponseDto> {
        return this.notificationService.markAllAsRead(userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    @ApiParam({ name: 'id', description: 'Notification ID' })
    @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
    @ApiResponse({ status: 404, description: 'Notification not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    remove(@Param('id') id: string) {
        return this.notificationService.remove(id);
    }
}
