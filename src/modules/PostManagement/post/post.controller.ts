import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiBearerAuth
} from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { PaginatedPostResponseDto } from './dto/pagination.dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Post()
    @TokenProtected()
    @ApiOperation({ summary: 'Create a new post' })
    @ApiBody({
        type: CreatePostDto,
        schema: {
            example: {
                userId: 'user-uuid-string',
                title: 'My Amazing Post Title',
                content: 'This is my post content...',
                isPublic: true,
                mlPrediction: 'category-prediction'
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Post created successfully',
        type: PostResponseDto,
        schema: {
            example: {
                id: 'uuid-string',
                userId: 'user-uuid-string',
                title: 'My Amazing Post Title',
                content: 'This is my post content...',
                nbLikes: 0,
                nbComments: 0,
                nbShares: 0,
                nbViews: 0,
                isPublic: true,
                mlPrediction: 'category-prediction',
                createdAt: '2025-07-30T10:30:00.000Z',
                updatedAt: '2025-07-30T10:30:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async create(
        @Body() createPostDto: CreatePostDto
    ): Promise<PostResponseDto> {
        return await this.postService.create(createPostDto);
    }

    @TokenProtected()
    @Get()
    @ApiOperation({ summary: 'Get all posts' })
    @ApiQuery({
        name: 'withRelations',
        required: false,
        type: Boolean,
        description: 'Include related data (user, media, likes, comments, etc.)'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page'
    })
    @ApiResponse({
        status: 200,
        description: 'Posts retrieved successfully',
        type: [PostResponseDto]
    })
    async findAll(
        @Query('withRelations') withRelations?: boolean,
        @Query('page') pageParam?: string,
        @Query('limit') limitParam?: string
    ) {
        // Convertir les paramètres en nombres si ils existent
        const page = pageParam ? parseInt(pageParam, 10) : undefined;
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Si des paramètres de pagination sont fournis
        if (page || limit) {
            const paginationDto = { page, limit };
            return await this.postService.findAllPaginated(paginationDto);
        }

        if (withRelations === true) {
            return await this.postService.findAllWithRelations();
        }
        return await this.postService.findAll();
    }

    @Get('public')
    @ApiOperation({ summary: 'Get all public posts' })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page'
    })
    @ApiResponse({
        status: 200,
        description: 'Public posts retrieved successfully',
        type: PaginatedPostResponseDto
    })
    async findPublicPosts(
        @Query('page') pageParam?: string,
        @Query('limit') limitParam?: string
    ) {
        // Convertir les paramètres en nombres si ils existent
        const page = pageParam ? parseInt(pageParam, 10) : undefined;
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Si des paramètres de pagination sont fournis
        if (page || limit) {
            const paginationDto = { page, limit };
            return await this.postService.findPublicPostsPaginated(
                paginationDto
            );
        }
        return await this.postService.findPublicPosts();
    }

    @TokenProtected()
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all posts by a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User posts retrieved successfully',
        type: [PostResponseDto]
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findByUser(
        @Param('userId') userId: string
    ): Promise<PostResponseDto[]> {
        return await this.postService.findByUser(userId);
    }

    @TokenProtected()
    @Get(':id')
    @ApiOperation({ summary: 'Get a post by ID' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiQuery({
        name: 'withRelations',
        required: false,
        type: Boolean,
        description: 'Include related data (user, media, likes, comments, etc.)'
    })
    @ApiResponse({
        status: 200,
        description: 'Post retrieved successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findOne(
        @Param('id') id: string,
        @Query('withRelations') withRelations?: boolean
    ) {
        if (withRelations === true) {
            return await this.postService.findOneWithRelations(id);
        }
        return await this.postService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post updated successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async update(
        @Param('id') id: string,
        @Body() updatePostDto: UpdatePostDto
    ): Promise<PostResponseDto> {
        return await this.postService.update(id, updatePostDto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post deleted successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async remove(@Param('id') id: string): Promise<PostResponseDto> {
        return await this.postService.remove(id);
    }

    // Actions spécifiques pour les interactions

    @TokenProtected()
    @Patch(':id/like')
    @ApiOperation({ summary: 'Increment likes count for a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Like count incremented successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @HttpCode(HttpStatus.OK)
    async incrementLikes(@Param('id') id: string): Promise<PostResponseDto> {
        return await this.postService.incrementLikes(id);
    }

    @TokenProtected()
    @Patch(':id/view')
    @ApiOperation({ summary: 'Increment views count for a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'View count incremented successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @HttpCode(HttpStatus.OK)
    async incrementViews(@Param('id') id: string): Promise<PostResponseDto> {
        return await this.postService.incrementViews(id);
    }

    @TokenProtected()
    @Patch(':id/comment')
    @ApiOperation({ summary: 'Increment comments count for a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment count incremented successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @HttpCode(HttpStatus.OK)
    async incrementComments(@Param('id') id: string): Promise<PostResponseDto> {
        return await this.postService.incrementComments(id);
    }

    @TokenProtected()
    @Patch(':id/share')
    @ApiOperation({ summary: 'Increment shares count for a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Share count incremented successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    @HttpCode(HttpStatus.OK)
    async incrementShares(@Param('id') id: string): Promise<PostResponseDto> {
        return await this.postService.incrementShares(id);
    }
}
