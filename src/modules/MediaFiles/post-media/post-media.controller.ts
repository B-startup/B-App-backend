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
    Query,
    HttpCode,
    HttpStatus,
    ParseEnumPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiParam, 
    ApiQuery,
    ApiConsumes,
    ApiBody
} from '@nestjs/swagger';
import { PostMediaType } from '@prisma/client';
import { PostMediaService } from './post-media.service';
import { 
    CreatePostMediaDto, 
    UpdatePostMediaDto, 
    PostMediaResponseDto,
    UploadPostMediaDto 
} from './dto';

@ApiTags('Post Media')
@Controller('post-media')
export class PostMediaController {
    constructor(private readonly postMediaService: PostMediaService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new post media record' })
    @ApiResponse({
        status: 201,
        description: 'Post media created successfully',
        type: PostMediaResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async create(@Body() createPostMediaDto: CreatePostMediaDto): Promise<PostMediaResponseDto> {
        return await this.postMediaService.create(createPostMediaDto);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a media file for a post' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Upload media file with post information',
        schema: {
            type: 'object',
            properties: {
                postId: {
                    type: 'string',
                    description: 'ID of the post'
                },
                mediaType: {
                    type: 'string',
                    enum: ['IMAGE', 'VIDEO'],
                    description: 'Type of media'
                },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Media file to upload'
                }
            },
            required: ['postId', 'mediaType', 'file']
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Media uploaded and created successfully',
        type: PostMediaResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid file or parameters' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async uploadMedia(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadDto: UploadPostMediaDto
    ): Promise<PostMediaResponseDto> {
        return await this.postMediaService.uploadAndCreate(file, uploadDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all post media' })
    @ApiQuery({
        name: 'withPost',
        required: false,
        type: Boolean,
        description: 'Include post information'
    })
    @ApiResponse({
        status: 200,
        description: 'Post media retrieved successfully',
        type: [PostMediaResponseDto]
    })
    async findAll(@Query('withPost') withPost?: boolean) {
        if (withPost === true) {
            return await this.postMediaService.findAllWithPost();
        }
        return await this.postMediaService.findAll();
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get all media for a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiQuery({
        name: 'type',
        required: false,
        enum: PostMediaType,
        description: 'Filter by media type'
    })
    @ApiResponse({
        status: 200,
        description: 'Post media retrieved successfully',
        type: [PostMediaResponseDto]
    })
    async findByPost(
        @Param('postId') postId: string,
        @Query('type') type?: PostMediaType
    ): Promise<PostMediaResponseDto[]> {
        if (type) {
            return await this.postMediaService.findByPostAndType(postId, type);
        }
        return await this.postMediaService.findByPost(postId);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Get all media by type' })
    @ApiParam({ 
        name: 'type', 
        description: 'Media type',
        enum: PostMediaType
    })
    @ApiResponse({
        status: 200,
        description: 'Media retrieved successfully',
        type: [PostMediaResponseDto]
    })
    async findByType(
        @Param('type', new ParseEnumPipe(PostMediaType)) type: PostMediaType
    ): Promise<PostMediaResponseDto[]> {
        return await this.postMediaService.findByType(type);
    }

    @Get('post/:postId/count')
    @ApiOperation({ summary: 'Count media for a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiQuery({
        name: 'type',
        required: false,
        enum: PostMediaType,
        description: 'Filter count by media type'
    })
    @ApiResponse({
        status: 200,
        description: 'Media count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number' }
            }
        }
    })
    async countByPost(
        @Param('postId') postId: string,
        @Query('type') type?: PostMediaType
    ): Promise<{ count: number }> {
        const count = type 
            ? await this.postMediaService.countByPostAndType(postId, type)
            : await this.postMediaService.countByPost(postId);
        
        return { count };
    }

    @Get('integrity/check')
    @ApiOperation({ 
        summary: 'Check file integrity (admin only)',
        description: 'Verify that all media files exist on disk'
    })
    @ApiResponse({
        status: 200,
        description: 'File integrity check completed',
        schema: {
            type: 'object',
            properties: {
                validCount: { type: 'number' },
                missingCount: { type: 'number' },
                missing: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PostMediaResponseDto' }
                }
            }
        }
    })
    async checkFileIntegrity() {
        const { valid, missing } = await this.postMediaService.checkFileIntegrity();
        return {
            validCount: valid.length,
            missingCount: missing.length,
            missing
        };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a post media by ID' })
    @ApiParam({ name: 'id', description: 'Post Media ID' })
    @ApiResponse({
        status: 200,
        description: 'Post media retrieved successfully',
        type: PostMediaResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post media not found' })
    async findOne(@Param('id') id: string): Promise<PostMediaResponseDto> {
        return await this.postMediaService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a post media' })
    @ApiParam({ name: 'id', description: 'Post Media ID' })
    @ApiResponse({
        status: 200,
        description: 'Post media updated successfully',
        type: PostMediaResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post media not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async update(
        @Param('id') id: string,
        @Body() updatePostMediaDto: UpdatePostMediaDto
    ): Promise<PostMediaResponseDto> {
        return await this.postMediaService.update(id, updatePostMediaDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post media and its file' })
    @ApiParam({ name: 'id', description: 'Post Media ID' })
    @ApiResponse({
        status: 200,
        description: 'Post media deleted successfully',
        type: PostMediaResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post media not found' })
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id') id: string): Promise<PostMediaResponseDto> {
        return await this.postMediaService.removeWithFile(id);
    }
}
