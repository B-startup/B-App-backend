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
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { OwnerProtected } from '../../../core/common/decorators/owner-protected.decorator';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeService } from '../like/like.service';
import { CreateLikeDto } from '../like/dto/create-like.dto';
import { ToggleLikeDto } from './dto/toggle-like.dto';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('comments')
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly likeService: LikeService
    ) {}

     @TokenProtected()
     @Post()
    @ApiOperation({ summary: 'Create a new comment' })
    @ApiResponse({ status: 201, description: 'Comment created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createCommentDto: CreateCommentDto) {
        return this.commentService.create(createCommentDto);
    }

    @TokenProtected()
    @Get()
    @ApiOperation({ summary: 'Get all comments' })
    @ApiResponse({
        status: 200,
        description: 'Comments retrieved successfully'
    })
    findAll() {
        return this.commentService.findAll();
    }

    @TokenProtected()
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get comments by user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User comments retrieved successfully'
    })
    findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.commentService.findByUser(userId);
    }

    @TokenProtected()
    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get comments for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project comments retrieved successfully'
    })
    findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
        return this.commentService.findByProject(projectId);
    }

    @TokenProtected()
    @Get('post/:postId')
    @ApiOperation({ summary: 'Get comments for a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post comments retrieved successfully'
    })
    findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
        return this.commentService.findByPost(postId);
    }

    @TokenProtected()
    @Get('replies/:parentId')
    @ApiOperation({ summary: 'Get replies for a specific comment' })
    @ApiParam({ name: 'parentId', description: 'Parent comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment replies retrieved successfully'
    })
    findReplies(@Param('parentId', ParseUUIDPipe) parentId: string) {
        return this.commentService.findReplies(parentId);
    }

    @TokenProtected()
    @Get('project/:projectId/stats')
    @ApiOperation({ summary: 'Get comment statistics for a project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project comment statistics retrieved successfully'
    })
    getProjectCommentStats(
        @Param('projectId', ParseUUIDPipe) projectId: string
    ) {
        return this.commentService.getProjectCommentStats(projectId);
    }

    @TokenProtected()
    @Get('post/:postId/stats')
    @ApiOperation({ summary: 'Get comment statistics for a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post comment statistics retrieved successfully'
    })
    getPostCommentStats(@Param('postId', ParseUUIDPipe) postId: string) {
        return this.commentService.getPostCommentStats(postId);
    }

    @TokenProtected()
    @Get('search')
    @ApiOperation({ summary: 'Search comments by keyword' })
    @ApiQuery({ name: 'keyword', description: 'Search keyword' })
    @ApiResponse({
        status: 200,
        description: 'Search results retrieved successfully'
    })
    search(@Query('keyword') keyword: string) {
        return this.commentService.search(keyword, ['content']);
    }

    @TokenProtected()
    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated comments' })
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
        description: 'Paginated comments retrieved successfully'
    })
    paginate(@Query('skip') skip?: string, @Query('take') take?: string) {
        const skipNum = skip ? parseInt(skip, 10) : 0;
        const takeNum = take ? parseInt(take, 10) : 10;
        return this.commentService.paginate(skipNum, takeNum);
    }

    @TokenProtected()
    @Get(':id')
    @ApiOperation({ summary: 'Get a comment by ID' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @OwnerProtected('comment')
    @ApiOperation({ summary: 'Update a comment (owner only)' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment updated successfully' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCommentDto: UpdateCommentDto,
        @CurrentUser() _user: any
    ) {
        return this.commentService.update(id, updateCommentDto);
    }

    @Post(':id/toggle-like')
    @TokenProtected()
    @ApiOperation({
        summary: 'Toggle like for a comment (requires authentication)'
    })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment like toggled successfully'
    })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized - token required' })
    async toggleLike(
        @Param('id', ParseUUIDPipe) commentId: string,
        @Body() toggleLikeData: ToggleLikeDto,
        @CurrentUser() user: any
    ) {
        const createLikeDto: CreateLikeDto = {
            userId: user.sub, // Standard JWT subject
            commentId
        };
        return this.likeService.toggleLike(createLikeDto);
    }

    @TokenProtected()
    @Get(':id/likes')
    @ApiOperation({ summary: 'Get likes for a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment likes retrieved successfully'
    })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    getCommentLikes(@Param('id', ParseUUIDPipe) commentId: string) {
        return this.likeService.findByComment(commentId);
    }

    @TokenProtected()
    @Get(':id/likes/count')
    @ApiOperation({ summary: 'Count likes for a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment like count retrieved successfully'
    })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    async getCommentLikeCount(@Param('id', ParseUUIDPipe) commentId: string) {
        const count = await this.likeService.countCommentLikes(commentId);
        return { count };
    }

    @TokenProtected()
    @Delete(':id')
    @OwnerProtected('comment')
    @ApiOperation({ summary: 'Delete a comment (owner only)' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
    remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() _user: any) {
        return this.commentService.remove(id);
    }
}
