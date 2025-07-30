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
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody
} from '@nestjs/swagger';
import { PostTagService } from './post-tag.service';
import { CreatePostTagDto } from './dto/create-post-tag.dto';
import { UpdatePostTagDto } from './dto/update-post-tag.dto';
import { PostTagResponseDto } from './dto/post-tag-response.dto';

@ApiTags('Post Tags')
@Controller('post-tag')
export class PostTagController {
    constructor(private readonly postTagService: PostTagService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new post-tag association' })
    @ApiBody({
        type: CreatePostTagDto,
        schema: {
            example: {
                postId: "post-uuid-string",
                tagId: "tag-uuid-string"
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Post-tag association created successfully',
        type: PostTagResponseDto,
        schema: {
            example: {
                id: "uuid-string",
                postId: "post-uuid-string",
                tagId: "tag-uuid-string",
                createdAt: "2025-07-30T10:30:00.000Z",
                updatedAt: "2025-07-30T10:30:00.000Z"
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Post or Tag not found' })
    @ApiResponse({ status: 409, description: 'Association already exists' })
    async create(@Body() createPostTagDto: CreatePostTagDto): Promise<PostTagResponseDto> {
        return await this.postTagService.createAssociation(createPostTagDto);
    }

    @Post('bulk/:postId')
    @ApiOperation({ summary: 'Add multiple tags to a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                tagIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ["tag-id-1", "tag-id-2", "tag-id-3"]
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Tags added to post successfully',
        type: [PostTagResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Post or one or more tags not found' })
    async addMultipleTagsToPost(
        @Param('postId') postId: string,
        @Body('tagIds') tagIds: string[]
    ): Promise<PostTagResponseDto[]> {
        return await this.postTagService.addMultipleTagsToPost(postId, tagIds);
    }

    @Get()
    @ApiOperation({ summary: 'Get all post-tag associations' })
    @ApiResponse({
        status: 200,
        description: 'Post-tag associations retrieved successfully',
        type: [PostTagResponseDto]
    })
    async findAll(): Promise<PostTagResponseDto[]> {
        return await this.postTagService.findAll();
    }

    @Get('popular-tags')
    @ApiOperation({ summary: 'Get popular tags by post count' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of tags to return (default: 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Popular tags retrieved successfully'
    })
    async findPopularTags(
        @Query('limit') limit?: string
    ) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return await this.postTagService.findPopularTags(limitNumber);
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get all tags associated with a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiQuery({
        name: 'withTags',
        required: false,
        type: Boolean,
        description: 'Include tag details'
    })
    @ApiResponse({
        status: 200,
        description: 'Post tags retrieved successfully',
        type: [PostTagResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findByPost(
        @Param('postId') postId: string,
        @Query('withTags') withTags?: boolean
    ) {
        if (withTags === true) {
            return await this.postTagService.findByPostWithTags(postId);
        }
        return await this.postTagService.findByPost(postId);
    }

    @Get('tag/:tagId')
    @ApiOperation({ summary: 'Get all posts associated with a tag' })
    @ApiParam({ name: 'tagId', description: 'Tag ID' })
    @ApiQuery({
        name: 'withPosts',
        required: false,
        type: Boolean,
        description: 'Include post details'
    })
    @ApiResponse({
        status: 200,
        description: 'Tag posts retrieved successfully',
        type: [PostTagResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    async findByTag(
        @Param('tagId') tagId: string,
        @Query('withPosts') withPosts?: boolean
    ) {
        if (withPosts === true) {
            return await this.postTagService.findByTagWithPosts(tagId);
        }
        return await this.postTagService.findByTag(tagId);
    }

    @Get('similar/:postId')
    @ApiOperation({ summary: 'Find similar posts based on shared tags' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of similar posts to return (default: 5)'
    })
    @ApiResponse({
        status: 200,
        description: 'Similar posts retrieved successfully'
    })
    async findSimilarPosts(
        @Param('postId') postId: string,
        @Query('limit') limit?: string
    ) {
        const limitNumber = limit ? parseInt(limit, 10) : 5;
        return await this.postTagService.findSimilarPosts(postId, limitNumber);
    }

    @Get('count/post/:postId')
    @ApiOperation({ summary: 'Count tags associated with a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post tag count retrieved successfully',
        schema: {
            example: { count: 3 }
        }
    })
    async countByPost(@Param('postId') postId: string) {
        const count = await this.postTagService.countByPost(postId);
        return { count };
    }

    @Get('count/tag/:tagId')
    @ApiOperation({ summary: 'Count posts associated with a tag' })
    @ApiParam({ name: 'tagId', description: 'Tag ID' })
    @ApiResponse({
        status: 200,
        description: 'Tag post count retrieved successfully',
        schema: {
            example: { count: 15 }
        }
    })
    async countByTag(@Param('tagId') tagId: string) {
        const count = await this.postTagService.countByTag(tagId);
        return { count };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get post-tag association by ID' })
    @ApiParam({ name: 'id', description: 'Post-tag association ID' })
    @ApiResponse({
        status: 200,
        description: 'Post-tag association found',
        type: PostTagResponseDto
    })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async findOne(@Param('id') id: string): Promise<PostTagResponseDto> {
        return await this.postTagService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update post-tag association by ID' })
    @ApiParam({ name: 'id', description: 'Post-tag association ID' })
    @ApiBody({ type: UpdatePostTagDto })
    @ApiResponse({
        status: 200,
        description: 'Post-tag association updated successfully',
        type: PostTagResponseDto
    })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async update(
        @Param('id') id: string,
        @Body() updatePostTagDto: UpdatePostTagDto
    ): Promise<PostTagResponseDto> {
        return await this.postTagService.update(id, updatePostTagDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete post-tag association by ID' })
    @ApiParam({ name: 'id', description: 'Post-tag association ID' })
    @ApiResponse({ status: 204, description: 'Association deleted successfully' })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.postTagService.remove(id);
    }

    @Delete('association/:postId/:tagId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete specific post-tag association' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiParam({ name: 'tagId', description: 'Tag ID' })
    @ApiResponse({ status: 204, description: 'Association deleted successfully' })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async removeAssociation(
        @Param('postId') postId: string,
        @Param('tagId') tagId: string
    ): Promise<void> {
        await this.postTagService.removeAssociation(postId, tagId);
    }
}
