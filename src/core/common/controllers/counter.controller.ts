import { Controller, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CounterService } from '../../../core/common/services/counter.service';
import { PrismaService } from '../../../core/services/prisma.service';

@ApiTags('Counter Management')
@Controller('admin/counters')
export class CounterController {
    private readonly counterService: CounterService;

    constructor(private readonly prisma: PrismaService) {
        this.counterService = new CounterService(prisma);
    }

    @Post('recalculate/project/:id')
    @ApiOperation({ summary: 'Recalculate all counters for a project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project counters recalculated successfully'
    })
    async recalculateProjectCounters(
        @Param('id', ParseUUIDPipe) projectId: string
    ) {
        await this.counterService.recalculateCounters('project', projectId);
        return { message: 'Project counters recalculated successfully' };
    }

    @Post('recalculate/post/:id')
    @ApiOperation({ summary: 'Recalculate all counters for a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post counters recalculated successfully'
    })
    async recalculatePostCounters(@Param('id', ParseUUIDPipe) postId: string) {
        await this.counterService.recalculateCounters('post', postId);
        return { message: 'Post counters recalculated successfully' };
    }

    @Post('recalculate/comment/:id')
    @ApiOperation({ summary: 'Recalculate all counters for a comment' })
    @ApiParam({ name: 'id', description: 'Comment ID' })
    @ApiResponse({
        status: 200,
        description: 'Comment counters recalculated successfully'
    })
    async recalculateCommentCounters(
        @Param('id', ParseUUIDPipe) commentId: string
    ) {
        await this.counterService.recalculateCounters('comment', commentId);
        return { message: 'Comment counters recalculated successfully' };
    }

    @Post('recalculate/all')
    @ApiOperation({
        summary: 'Recalculate all counters for all entities (maintenance)'
    })
    @ApiResponse({
        status: 200,
        description: 'All counters recalculated successfully'
    })
    async recalculateAllCounters() {
        // Recalculer pour tous les projets
        const projects = await this.prisma.project.findMany({
            select: { id: true }
        });
        for (const project of projects) {
            await this.counterService.recalculateCounters(
                'project',
                project.id
            );
        }

        // Recalculer pour tous les posts
        const posts = await this.prisma.post.findMany({ select: { id: true } });
        for (const post of posts) {
            await this.counterService.recalculateCounters('post', post.id);
        }

        // Recalculer pour tous les commentaires
        const comments = await this.prisma.comment.findMany({
            select: { id: true }
        });
        for (const comment of comments) {
            await this.counterService.recalculateCounters(
                'comment',
                comment.id
            );
        }

        return {
            message: 'All counters recalculated successfully',
            stats: {
                projects: projects.length,
                posts: posts.length,
                comments: comments.length
            }
        };
    }
}
