import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    HttpCode,
    HttpStatus,
    ParseUUIDPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';
import { DiscussionService } from './discussion.service';
import { CreateDiscussionDto, DiscussionResponseDto } from './dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { GetCurrentUserId } from '../../../core/common/decorators/get-current-user-id.decorator';

@ApiTags('Discussion Management')
@ApiBearerAuth()
@Controller('discussion')
export class DiscussionController {
    constructor(private readonly discussionService: DiscussionService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @TokenProtected()
    @ApiOperation({ summary: 'Create a new discussion' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Discussion created successfully',
        type: DiscussionResponseDto
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Cannot create discussion with yourself or discussion already exists'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project not found (if project discussion)'
    })
    async createDiscussion(
        @GetCurrentUserId() userId: string,
        @Body() createDiscussionDto: CreateDiscussionDto
    ): Promise<DiscussionResponseDto> {
        return this.discussionService.createDiscussion(userId, createDiscussionDto);
    }

    @Get('my-discussions')
    @TokenProtected()
    @ApiOperation({ summary: 'Get all discussions for current user' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User discussions retrieved successfully',
        type: [DiscussionResponseDto]
    })
    async getUserDiscussions(
        @GetCurrentUserId() userId: string
    ): Promise<DiscussionResponseDto[]> {
        return this.discussionService.getUserDiscussions(userId);
    }

    @Get('search')
    @TokenProtected()
    @ApiOperation({ summary: 'Search discussions by user name or project title' })
    @ApiQuery({ 
        name: 'q', 
        description: 'Search query', 
        required: true,
        example: 'john doe' 
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Search results retrieved successfully',
        type: [DiscussionResponseDto]
    })
    async searchDiscussions(
        @GetCurrentUserId() userId: string,
        @Query('q') query: string
    ): Promise<DiscussionResponseDto[]> {
        return this.discussionService.searchDiscussions(userId, query);
    }

    @Get('project/:projectId')
    @TokenProtected()
    @ApiOperation({ summary: 'Get all discussions for a specific project' })
    @ApiParam({ 
        name: 'projectId', 
        description: 'Project ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project discussions retrieved successfully',
        type: [DiscussionResponseDto]
    })
    async getProjectDiscussions(
        @Param('projectId', ParseUUIDPipe) projectId: string
    ): Promise<DiscussionResponseDto[]> {
        return this.discussionService.getProjectDiscussions(projectId);
    }

    @Get(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Get a specific discussion by ID' })
    @ApiParam({ 
        name: 'id', 
        description: 'Discussion ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Discussion retrieved successfully',
        type: DiscussionResponseDto
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Discussion not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'You are not authorized to access this discussion'
    })
    async getDiscussionById(
        @Param('id', ParseUUIDPipe) discussionId: string,
        @GetCurrentUserId() userId: string
    ): Promise<DiscussionResponseDto> {
        return this.discussionService.getDiscussionById(discussionId, userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @TokenProtected()
    @ApiOperation({ summary: 'Delete a discussion' })
    @ApiParam({ 
        name: 'id', 
        description: 'Discussion ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Discussion deleted successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Discussion not found'
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Only the discussion initiator can delete it'
    })
    async deleteDiscussion(
        @Param('id', ParseUUIDPipe) discussionId: string,
        @GetCurrentUserId() userId: string
    ): Promise<void> {
        return this.discussionService.deleteDiscussion(discussionId, userId);
    }
}
