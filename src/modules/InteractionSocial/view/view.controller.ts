import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ViewService } from './view.service';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { ViewResponseDto } from './dto/view-response.dto';

@ApiTags('Views')
@Controller('view')
export class ViewController {
    constructor(private readonly viewService: ViewService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new view record' })
    @ApiResponse({
        status: 201,
        description: 'View record created successfully',
        type: ViewResponseDto
    })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    async create(@Body() createViewDto: CreateViewDto) {
        return this.viewService.create(createViewDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all view records' })
    @ApiResponse({
        status: 200,
        description: 'List of all view records',
        type: [ViewResponseDto]
    })
    async findAll() {
        return this.viewService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all views by a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'List of views by user',
        type: [ViewResponseDto]
    })
    async findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.viewService.findByUser(userId);
    }

    @Get('video/:videoId')
    @ApiOperation({ summary: 'Get all views for a specific video' })
    @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'List of views for video',
        type: [ViewResponseDto]
    })
    async findByVideo(@Param('videoId', ParseUUIDPipe) videoId: string) {
        return this.viewService.findByVideo(videoId);
    }

    @Get('video/:videoId/count')
    @ApiOperation({ summary: 'Get total view count for a video' })
    @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'View count for video',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number' }
            }
        }
    })
    async countVideoViews(@Param('videoId', ParseUUIDPipe) videoId: string) {
        return this.viewService.countVideoViews(videoId);
    }

    @Get('video/:videoId/total-time')
    @ApiOperation({ summary: 'Get total time spent viewing a video' })
    @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'Total time spent viewing video',
        schema: {
            type: 'object',
            properties: {
                totalTime: { type: 'number' }
            }
        }
    })
    async getTotalTimeSpent(@Param('videoId', ParseUUIDPipe) videoId: string) {
        return this.viewService.getTotalTimeSpent(videoId);
    }

    @Get('check/:userId/:videoId')
    @ApiOperation({ summary: 'Check if user has viewed a video' })
    @ApiParam({ name: 'userId', description: 'User ID', type: 'string' })
    @ApiParam({ name: 'videoId', description: 'Video ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'Whether user has viewed the video',
        schema: {
            type: 'object',
            properties: {
                hasViewed: { type: 'boolean' }
            }
        }
    })
    async hasUserViewed(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Param('videoId', ParseUUIDPipe) videoId: string
    ) {
        return this.viewService.hasUserViewed(userId, videoId);
    }

    @Get('user/:userId/stats')
    @ApiOperation({ summary: 'Get viewing statistics for a user' })
    @ApiParam({ name: 'userId', description: 'User ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'User viewing statistics',
        schema: {
            type: 'object',
            properties: {
                totalViews: { type: 'number' },
                totalTimeSpent: { type: 'number' },
                uniqueVideos: { type: 'number' }
            }
        }
    })
    async getUserViewingStats(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.viewService.getUserViewingStats(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific view by ID' })
    @ApiParam({ name: 'id', description: 'View ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'View record found',
        type: ViewResponseDto
    })
    @ApiResponse({ status: 404, description: 'View not found' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.viewService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a view record' })
    @ApiParam({ name: 'id', description: 'View ID', type: 'string' })
    @ApiResponse({
        status: 200,
        description: 'View record updated successfully',
        type: ViewResponseDto
    })
    @ApiResponse({ status: 404, description: 'View not found' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateViewDto: UpdateViewDto
    ) {
        return this.viewService.update(id, updateViewDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a view record' })
    @ApiParam({ name: 'id', description: 'View ID', type: 'string' })
    @ApiResponse({
        status: 204,
        description: 'View record deleted successfully'
    })
    @ApiResponse({ status: 404, description: 'View not found' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.viewService.remove(id);
    }
}
