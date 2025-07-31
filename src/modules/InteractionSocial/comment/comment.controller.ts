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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new comment' })
    @ApiResponse({ status: 201, description: 'Comment created successfully' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    create(@Body() createCommentDto: CreateCommentDto) {
        return this.commentService.create(createCommentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all comments' })
    @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
    findAll() {
        return this.commentService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Get comments by user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User comments retrieved successfully' })
    findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.commentService.findByUser(userId);
    }

    @Get('project/:projectId')
    @ApiOperation({ summary: 'Get comments for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project comments retrieved successfully' })
    findByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
        return this.commentService.findByProject(projectId);
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get comments for a specific post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Post comments retrieved successfully' })
    findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
        return this.commentService.findByPost(postId);
    }

    @Get('replies/:parentId')
    @ApiOperation({ summary: 'Get replies for a specific comment' })
    @ApiParam({ name: 'parentId', description: 'Parent comment ID' })
    @ApiResponse({ status: 200, description: 'Comment replies retrieved successfully' })
    findReplies(@Param('parentId', ParseUUIDPipe) parentId: string) {
        return this.commentService.findReplies(parentId);
    }

    @Get('project/:projectId/stats')
    @ApiOperation({ summary: 'Get comment statistics for a project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({ status: 200, description: 'Project comment statistics retrieved successfully' })
    getProjectCommentStats(@Param('projectId', ParseUUIDPipe) projectId: string) {
        return this.commentService.getProjectCommentStats(projectId);
    }

    @Get('post/:postId/stats')
    @ApiOperation({ summary: 'Get comment statistics for a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Post comment statistics retrieved successfully' })
    getPostCommentStats(@Param('postId', ParseUUIDPipe) postId: string) {
        return this.commentService.getPostCommentStats(postId);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search comments by keyword' })
    @ApiQuery({ name: 'keyword', description: 'Search keyword' })
    @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
    search(@Query('keyword') keyword: string) {
        return this.commentService.search(keyword, ['content']);
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated comments' })
    @ApiQuery({ name: 'skip', required: false, description: 'Number of items to skip' })
    @ApiQuery({ name: 'take', required: false, description: 'Number of items to take' })
    @ApiResponse({ status: 200, description: 'Paginated comments retrieved successfully' })
    paginate(
        @Query('skip') skip?: string,
        @Query('take') take?: string
    ) {
        const skipNum = skip ? parseInt(skip, 10) : 0;
        const takeNum = take ? parseInt(take, 10) : 10;
        return this.commentService.paginate(skipNum, takeNum);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a comment by ID' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment updated successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCommentDto: UpdateCommentDto
    ) {
        return this.commentService.update(id, updateCommentDto);
    }

    @Patch(':id/increment-likes')
    @ApiOperation({ summary: 'Increment likes for a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment likes incremented successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    incrementLikes(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentService.incrementLikes(id);
    }

    @Patch(':id/decrement-likes')
    @ApiOperation({ summary: 'Decrement likes for a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment likes decremented successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    decrementLikes(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentService.decrementLikes(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
    @ApiResponse({ status: 404, description: 'Comment not found' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.commentService.remove(id);
    }
}
