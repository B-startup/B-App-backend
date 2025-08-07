import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiConsumes,
    ApiBearerAuth
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CreateVideoDto, UpdateVideoDto, VideoResponseDto, UploadVideoDto } from './dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Project Videos')
@ApiBearerAuth()
@Controller('project-videos')
export class VideoController {
    constructor(private readonly videoService: VideoService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a new video entry' })
    @ApiBody({ type: CreateVideoDto })
    @ApiResponse({
        status: 201,
        description: 'Video created successfully',
        type: VideoResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async create(@Body() createVideoDto: CreateVideoDto): Promise<VideoResponseDto> {
        return await this.videoService.create(createVideoDto);
    }

    @TokenProtected()
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a video file' })
    @ApiBody({
        description: 'Video upload data',
        type: UploadVideoDto
    })
    @ApiResponse({
        status: 201,
        description: 'Video uploaded successfully',
        type: VideoResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadData: UploadVideoDto
    ): Promise<VideoResponseDto> {
        return await this.videoService.uploadVideo(file, uploadData);
    }

    @TokenProtected()
    @Get()
    @ApiOperation({ summary: 'Get all videos' })
    @ApiQuery({
        name: 'projectId',
        required: false,
        description: 'Filter by project ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Videos retrieved successfully',
        type: [VideoResponseDto]
    })
    async findAll(@Query('projectId') projectId?: string): Promise<VideoResponseDto[]> {
        if (projectId) {
            return await this.videoService.findByProject(projectId);
        }
        return await this.videoService.findAll();
    }

    @TokenProtected()
    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get all videos for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project videos retrieved successfully',
        type: [VideoResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async findByProject(@Param('projectId') projectId: string): Promise<VideoResponseDto[]> {
        return await this.videoService.findByProject(projectId);
    }

    @TokenProtected()
    @Get('count/project/:projectId')
    @ApiOperation({ summary: 'Count videos for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Video count retrieved successfully',
        schema: {
            example: { count: 5 }
        }
    })
    async countByProject(@Param('projectId') projectId: string) {
        const count = await this.videoService.countByProject(projectId);
        return { count };
    }

    @TokenProtected()
    @Get(':id')
    @ApiOperation({ summary: 'Get video by ID' })
    @ApiParam({ name: 'id', description: 'Video ID' })
    @ApiResponse({
        status: 200,
        description: 'Video found',
        type: VideoResponseDto
    })
    @ApiResponse({ status: 404, description: 'Video not found' })
    async findOne(@Param('id') id: string): Promise<VideoResponseDto> {
        return await this.videoService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update video by ID' })
    @ApiParam({ name: 'id', description: 'Video ID' })
    @ApiBody({ type: UpdateVideoDto })
    @ApiResponse({
        status: 200,
        description: 'Video updated successfully',
        type: VideoResponseDto
    })
    @ApiResponse({ status: 404, description: 'Video not found' })
    async update(
        @Param('id') id: string,
        @Body() updateVideoDto: UpdateVideoDto
    ): Promise<VideoResponseDto> {
        return await this.videoService.update(id, updateVideoDto);
    }

    @TokenProtected()
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete video by ID' })
    @ApiParam({ name: 'id', description: 'Video ID' })
    @ApiResponse({
        status: 204,
        description: 'Video deleted successfully'
    })
    @ApiResponse({ status: 404, description: 'Video not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.videoService.remove(id);
    }
}
