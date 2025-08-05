import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery
} from '@nestjs/swagger';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@ApiTags('Likes')
@Controller('likes')
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new like' })
    @ApiResponse({ status: 201, description: 'Like created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({
        status: 409,
        description: 'User has already liked this item'
    })
    create(@Body() createLikeDto: CreateLikeDto) {
        return this.likeService.create(createLikeDto);
    }

    @Post('toggle')
    @ApiOperation({ summary: 'Toggle like (like/unlike)' })
    @ApiResponse({ status: 200, description: 'Like toggled successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    toggleLike(@Body() createLikeDto: CreateLikeDto) {
        return this.likeService.toggleLike(createLikeDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all likes' })
    @ApiResponse({ status: 200, description: 'Likes retrieved successfully' })
    findAll() {
        return this.likeService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get likes by user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User likes retrieved successfully'
    })
    findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.likeService.findByUser(userId);
    }

    @Get('user/:userId/activity')
    @ApiOperation({ summary: 'Get user like activity statistics' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User like activity retrieved successfully'
    })
    getUserLikeActivity(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.likeService.getUserLikeActivity(userId);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get likes for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project likes retrieved successfully'
    })
    findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
        return this.likeService.findByProject(projectId);
    }

    @Get('project/:projectId/count')
    @ApiOperation({ summary: 'Count likes for a project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project like count retrieved successfully'
    })
    async countProjectLikes(
        @Param('projectId', ParseUUIDPipe) projectId: string
    ) {
        const count = await this.likeService.countProjectLikes(projectId);
        return { count };
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get likes for a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post likes retrieved successfully'
    })
    findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
        return this.likeService.findByPost(postId);
    }

    @Get('post/:postId/count')
    @ApiOperation({ summary: 'Count likes for a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post like count retrieved successfully'
    })
    async countPostLikes(@Param('postId', ParseUUIDPipe) postId: string) {
        const count = await this.likeService.countPostLikes(postId);
        return { count };
    }

    @Get('comment/:commentId')
    @ApiOperation({ summary: 'Get likes for a specific comment' })
    @ApiParam({ name: 'commentId', description: 'Comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment likes retrieved successfully'
    })
    findByComment(@Param('commentId', ParseUUIDPipe) commentId: string) {
        return this.likeService.findByComment(commentId);
    }

    @Get('comment/:commentId/count')
    @ApiOperation({ summary: 'Count likes for a comment' })
    @ApiParam({ name: 'commentId', description: 'Comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment like count retrieved successfully'
    })
    async countCommentLikes(
        @Param('commentId', ParseUUIDPipe) commentId: string
    ) {
        const count = await this.likeService.countCommentLikes(commentId);
        return { count };
    }

    @Get('check/:userId/:targetId')
    @ApiOperation({ summary: 'Check if user has liked a specific item' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiParam({ name: 'targetId', description: 'Target item ID' })
    @ApiQuery({
        name: 'type',
        enum: ['project', 'post', 'comment'],
        description: 'Target type'
    })
    @ApiResponse({
        status: 200,
        description: 'Like status checked successfully'
    })
    async hasUserLiked(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Param('targetId', ParseUUIDPipe) targetId: string,
        @Query('type') targetType: 'project' | 'post' | 'comment'
    ) {
        const hasLiked = await this.likeService.hasUserLiked(
            userId,
            targetId,
            targetType
        );
        return { hasLiked };
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated likes' })
    @ApiQuery({
        name: 'skip',
        required: false,
        description: 'Number of items to skip'
    })
    @ApiQuery({
        name: 'take',
        required: false,
        description: 'Number of items to take'
    })
    @ApiResponse({
        status: 200,
        description: 'Paginated likes retrieved successfully'
    })
    paginate(@Query('skip') skip?: string, @Query('take') take?: string) {
        const skipNum = skip ? parseInt(skip, 10) : 0;
        const takeNum = take ? parseInt(take, 10) : 10;
        return this.likeService.paginate(skipNum, takeNum);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a like by ID' })
    @ApiParam({ name: 'id', description: 'Like ID' })
    @ApiResponse({ status: 200, description: 'Like retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Like not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.likeService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a like' })
    @ApiParam({ name: 'id', description: 'Like ID' })
    @ApiResponse({ status: 200, description: 'Like updated successfully' })
    @ApiResponse({ status: 404, description: 'Like not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateLikeDto: UpdateLikeDto
    ) {
        return this.likeService.update(id, updateLikeDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a like' })
    @ApiParam({ name: 'id', description: 'Like ID' })
    @ApiResponse({ status: 200, description: 'Like deleted successfully' })
    @ApiResponse({ status: 404, description: 'Like not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.likeService.remove(id);
    }
}
