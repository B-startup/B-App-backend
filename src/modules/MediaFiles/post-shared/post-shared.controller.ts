import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody
} from '@nestjs/swagger';
import { PostSharedService } from './post-shared.service';
import { CreatePostSharedDto } from './dto/create-post-shared.dto';
import { UpdatePostSharedDto } from './dto/update-post-shared.dto';
import { PostSharedResponseDto } from './dto/post-shared-response.dto';

@ApiTags('Post Shares')
@Controller('post-shared')
export class PostSharedController {
    constructor(private readonly postSharedService: PostSharedService) {}

    @Post()
    @ApiOperation({ summary: 'Share a post' })
    @ApiBody({
        type: CreatePostSharedDto,
        schema: {
            example: {
                postId: 'post-uuid-string',
                userId: 'user-uuid-string',
                description: 'Check out this amazing post!'
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Post shared successfully',
        type: PostSharedResponseDto,
        schema: {
            example: {
                id: 'uuid-string',
                postId: 'post-uuid-string',
                userId: 'user-uuid-string',
                description: 'Check out this amazing post!',
                createdAt: '2025-07-30T10:30:00.000Z',
                updatedAt: '2025-07-30T10:30:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Post or User not found' })
    @ApiResponse({
        status: 409,
        description: 'User has already shared this post'
    })
    async create(
        @Body() createPostSharedDto: CreatePostSharedDto
    ): Promise<PostSharedResponseDto> {
        return await this.postSharedService.sharePost(createPostSharedDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all post shares' })
    @ApiResponse({
        status: 200,
        description: 'Post shares retrieved successfully',
        type: [PostSharedResponseDto]
    })
    async findAll(): Promise<PostSharedResponseDto[]> {
        return await this.postSharedService.findAll();
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get all shares of a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiQuery({
        name: 'withUsers',
        required: false,
        type: Boolean,
        description: 'Include user information'
    })
    @ApiResponse({
        status: 200,
        description: 'Post shares retrieved successfully',
        type: [PostSharedResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findByPost(
        @Param('postId') postId: string,
        @Query('withUsers') withUsers?: boolean
    ) {
        if (withUsers === true) {
            return await this.postSharedService.findByPostWithUsers(postId);
        }
        return await this.postSharedService.findByPost(postId);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all posts shared by a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiQuery({
        name: 'withPosts',
        required: false,
        type: Boolean,
        description: 'Include post details'
    })
    @ApiResponse({
        status: 200,
        description: 'User shares retrieved successfully',
        type: [PostSharedResponseDto]
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findByUser(
        @Param('userId') userId: string,
        @Query('withPosts') withPosts?: boolean
    ) {
        if (withPosts === true) {
            return await this.postSharedService.findUserSharesWithPosts(userId);
        }
        return await this.postSharedService.findByUser(userId);
    }

    @Get('post/:postId/count')
    @ApiOperation({ summary: 'Count shares of a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Share count retrieved successfully',
        schema: {
            example: { count: 42 }
        }
    })
    async countByPost(@Param('postId') postId: string) {
        const count = await this.postSharedService.countSharesByPost(postId);
        return { count };
    }

    @Get('user/:userId/count')
    @ApiOperation({ summary: 'Count posts shared by a user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'Share count retrieved successfully',
        schema: {
            example: { count: 15 }
        }
    })
    async countByUser(@Param('userId') userId: string) {
        const count = await this.postSharedService.countSharesByUser(userId);
        return { count };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a post share by ID' })
    @ApiParam({ name: 'id', description: 'Post Share ID' })
    @ApiResponse({
        status: 200,
        description: 'Post share retrieved successfully',
        type: PostSharedResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post share not found' })
    async findOne(@Param('id') id: string): Promise<PostSharedResponseDto> {
        return await this.postSharedService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a post share' })
    @ApiParam({ name: 'id', description: 'Post Share ID' })
    @ApiResponse({
        status: 200,
        description: 'Post share updated successfully',
        type: PostSharedResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post share not found' })
    async update(
        @Param('id') id: string,
        @Body() updatePostSharedDto: UpdatePostSharedDto
    ): Promise<PostSharedResponseDto> {
        return await this.postSharedService.update(id, updatePostSharedDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post share by ID' })
    @ApiParam({ name: 'id', description: 'Post Share ID' })
    @ApiResponse({
        status: 200,
        description: 'Post share deleted successfully',
        type: PostSharedResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post share not found' })
    async remove(@Param('id') id: string): Promise<PostSharedResponseDto> {
        return await this.postSharedService.remove(id);
    }

    @Delete('unshare/:userId/:postId')
    @ApiOperation({ summary: 'Unshare a post (remove share by user and post)' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post unshared successfully',
        type: PostSharedResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post share not found' })
    async unshare(
        @Param('userId') userId: string,
        @Param('postId') postId: string
    ): Promise<PostSharedResponseDto> {
        return await this.postSharedService.unsharePost(userId, postId);
    }
}
