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
    @ApiOperation({ summary: 'Get all posts (optimized)' })
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
        @Query('page') pageParam?: string,
        @Query('limit') limitParam?: string
    ) {
        // Convertir les paramètres en nombres si ils existent
        const page = pageParam ? parseInt(pageParam, 10) : undefined;
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Si des paramètres de pagination sont fournis, utiliser la version optimisée
        if (page || limit) {
            const paginationDto = { page, limit };
            return await this.postService.findAllPaginatedOptimized(paginationDto);
        }

        // Utiliser la version optimisée par défaut
        return await this.postService.findAllOptimized();
    }

    @Get('public')
    @ApiOperation({ summary: 'Get all public posts (optimized)' })
    @ApiResponse({
        status: 200,
        description: 'Public posts retrieved successfully',
        type: [PostResponseDto]
    })
    async findPublicPosts() {
        // Utiliser la version optimisée uniquement
        return await this.postService.findPublicPostsOptimized();
    }

    @TokenProtected()
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all posts by a specific user (optimized)' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User posts retrieved successfully',
        type: [PostResponseDto]
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    async findByUser(
        @Param('userId') userId: string
    ) {
        return await this.postService.findByUserOptimized(userId);
    }

    @TokenProtected()
    @Get(':id')
    @ApiOperation({ summary: 'Get a post by ID with all relations' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post retrieved successfully',
        type: PostResponseDto
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findOne(@Param('id') id: string) {
        // Utiliser toujours la version avec relations pour les détails d'un post
        return await this.postService.findOneWithRelations(id);
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

    @TokenProtected()
    @Get('search')
    @ApiOperation({ summary: 'Search posts by content (optimized)' })
    @ApiQuery({
        name: 'q',
        required: true,
        type: String,
        description: 'Search term'
    })
    @ApiResponse({
        status: 200,
        description: 'Search results retrieved successfully',
        type: [PostResponseDto]
    })
    async searchPosts(@Query('q') searchTerm: string) {
        return await this.postService.searchPostsOptimized(searchTerm);
    }
}
