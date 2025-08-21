import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe,
    ParseIntPipe,
    DefaultValuePipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto, UpdateMessageDto, MessageResponseDto } from './dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { GetCurrentUserId } from '../../../core/common/decorators/get-current-user-id.decorator';

@ApiTags('Message Management')
@ApiBearerAuth()
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @TokenProtected()
    @ApiOperation({ summary: 'Send a new message in a discussion' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Message sent successfully',
        type: MessageResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Discussion not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You are not authorized to send messages in this discussion'
    })
    async sendMessage(
        @GetCurrentUserId() userId: string,
        @Body() createMessageDto: CreateMessageDto
    ): Promise<MessageResponseDto> {
        return this.messageService.sendMessage(userId, createMessageDto);
    }

    @Get('discussion/:discussionId')
    @TokenProtected()
    @ApiOperation({ summary: 'Get all messages in a discussion with pagination' })
    @ApiParam({ 
        name: 'discussionId', 
        description: 'Discussion ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({ 
        name: 'page', 
        description: 'Page number (default: 1)',
        required: false,
        example: 1
    })
    @ApiQuery({ 
        name: 'limit', 
        description: 'Number of messages per page (default: 50)',
        required: false,
        example: 50
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Messages retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                messages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MessageResponseDto' }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number', example: 1 },
                        limit: { type: 'number', example: 50 },
                        total: { type: 'number', example: 125 },
                        totalPages: { type: 'number', example: 3 }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Discussion not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You are not authorized to access messages in this discussion'
    })
    async getDiscussionMessages(
        @Param('discussionId', ParseUUIDPipe) discussionId: string,
        @GetCurrentUserId() userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number
    ) {
        return this.messageService.getDiscussionMessages(discussionId, userId, page, limit);
    }

    @Get('discussion/:discussionId/search')
    @TokenProtected()
    @ApiOperation({ summary: 'Search messages in a discussion' })
    @ApiParam({ 
        name: 'discussionId', 
        description: 'Discussion ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiQuery({ 
        name: 'q', 
        description: 'Search query', 
        required: true,
        example: 'hello world' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Search results retrieved successfully',
        type: [MessageResponseDto]
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Discussion not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You are not authorized to search messages in this discussion'
    })
    async searchMessages(
        @Param('discussionId', ParseUUIDPipe) discussionId: string,
        @GetCurrentUserId() userId: string,
        @Query('q') query: string
    ): Promise<MessageResponseDto[]> {
        return this.messageService.searchMessages(discussionId, userId, query);
    }

    @Get('recent')
    @TokenProtected()
    @ApiOperation({ summary: 'Get user\'s recent messages across all discussions' })
    @ApiQuery({ 
        name: 'limit', 
        description: 'Number of messages to retrieve (default: 20)',
        required: false,
        example: 20
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Recent messages retrieved successfully',
        type: [MessageResponseDto]
    })
    async getUserRecentMessages(
        @GetCurrentUserId() userId: string,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number
    ): Promise<MessageResponseDto[]> {
        return this.messageService.getUserRecentMessages(userId, limit);
    }

    @Get(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Get a specific message by ID' })
    @ApiParam({ 
        name: 'id', 
        description: 'Message ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Message retrieved successfully',
        type: MessageResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Message not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You are not authorized to access this message'
    })
    async getMessageById(
        @Param('id', ParseUUIDPipe) messageId: string,
        @GetCurrentUserId() userId: string
    ): Promise<MessageResponseDto> {
        return this.messageService.getMessageById(messageId, userId);
    }

    @Patch(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Update a message (only sender can update)' })
    @ApiParam({ 
        name: 'id', 
        description: 'Message ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Message updated successfully',
        type: MessageResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Message not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You can only update your own messages'
    })
    async updateMessage(
        @Param('id', ParseUUIDPipe) messageId: string,
        @GetCurrentUserId() userId: string,
        @Body() updateMessageDto: UpdateMessageDto
    ): Promise<MessageResponseDto> {
        return this.messageService.updateMessage(messageId, userId, updateMessageDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @TokenProtected()
    @ApiOperation({ summary: 'Delete a message (only sender can delete)' })
    @ApiParam({ 
        name: 'id', 
        description: 'Message ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Message deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Message not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You can only delete your own messages'
    })
    async deleteMessage(
        @Param('id', ParseUUIDPipe) messageId: string,
        @GetCurrentUserId() userId: string
    ): Promise<void> {
        return this.messageService.deleteMessage(messageId, userId);
    }
}
