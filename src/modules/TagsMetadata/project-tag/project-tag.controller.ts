import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
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
    ApiBody
} from '@nestjs/swagger';
import { ProjectTagService } from './project-tag.service';
import { CreateProjectTagDto } from './dto/create-project-tag.dto';
import { ProjectTagResponseDto } from './dto/project-tag-response.dto';

@ApiTags('Project Tags')
@Controller('project-tags')
export class ProjectTagController {
    constructor(private readonly projectTagService: ProjectTagService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new project-tag association' })
    @ApiBody({ type: CreateProjectTagDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Association created successfully',
        type: ProjectTagResponseDto
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Association already exists'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Project or tag not found'
    })
    async createAssociation(@Body() createProjectTagDto: CreateProjectTagDto) {
        return this.projectTagService.createAssociation(createProjectTagDto);
    }

    @Post('multiple')
    @ApiOperation({ summary: 'Add multiple tags to a project' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                projectId: { type: 'string', example: 'project-uuid-123' },
                tagIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['tag-uuid-1', 'tag-uuid-2', 'tag-uuid-3']
                }
            },
            required: ['projectId', 'tagIds']
        }
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Tags added successfully',
        type: [ProjectTagResponseDto]
    })
    async addMultipleTags(
        @Body() body: { projectId: string; tagIds: string[] }
    ) {
        return this.projectTagService.addMultipleTagsToProject(
            body.projectId,
            body.tagIds
        );
    }

    @Get('project/:id')
    @ApiOperation({ summary: 'Get all tags for a specific project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiQuery({
        name: 'withDetails',
        required: false,
        type: 'boolean',
        description: 'Include tag details'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project tags retrieved successfully',
        type: [ProjectTagResponseDto]
    })
    async findByProject(
        @Param('id') projectId: string,
        @Query('withDetails') withDetails?: boolean
    ) {
        if (withDetails === true) {
            return this.projectTagService.findByProjectWithTags(projectId);
        }
        return this.projectTagService.findByProject(projectId);
    }

    @Get('tag/:id')
    @ApiOperation({ summary: 'Get all projects for a specific tag' })
    @ApiParam({ name: 'id', description: 'Tag ID' })
    @ApiQuery({
        name: 'withDetails',
        required: false,
        type: 'boolean',
        description: 'Include project details'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tag projects retrieved successfully',
        type: [ProjectTagResponseDto]
    })
    async findByTag(
        @Param('id') tagId: string,
        @Query('withDetails') withDetails?: boolean
    ) {
        if (withDetails === true) {
            return this.projectTagService.findByTagWithProjects(tagId);
        }
        return this.projectTagService.findByTag(tagId);
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a project-tag association' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                projectId: { type: 'string', example: 'project-uuid-123' },
                tagId: { type: 'string', example: 'tag-uuid-456' }
            },
            required: ['projectId', 'tagId']
        }
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Association removed successfully'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Association not found'
    })
    async removeAssociation(
        @Body() body: { projectId: string; tagId: string }
    ) {
        await this.projectTagService.removeAssociation(
            body.projectId,
            body.tagId
        );
    }

    @Get('popular')
    @ApiOperation({ summary: 'Get popular tags (most used in projects)' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: 'number',
        description: 'Number of results to return',
        example: 10
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Popular tags retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    projectCount: { type: 'number' }
                }
            }
        }
    })
    async findPopularTags(@Query('limit') limit?: number) {
        return this.projectTagService.findPopularTags(limit ? Number(limit) : 10);
    }

    @Get('similar/:id')
    @ApiOperation({ summary: 'Find projects similar to a given project based on shared tags' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: 'number',
        description: 'Number of similar projects to return',
        example: 5
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Similar projects retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    status: { type: 'string' },
                    logoImage: { type: 'string' },
                    projectStage: { type: 'string' },
                    financialGoal: { type: 'number' },
                    nbLikes: { type: 'number' },
                    nbViews: { type: 'number' },
                    verifiedProject: { type: 'boolean' },
                    createdAt: { type: 'string' },
                    creator: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            profilePicture: { type: 'string' }
                        }
                    }
                }
            }
        }
    })
    async findSimilarProjects(
        @Param('id') projectId: string,
        @Query('limit') limit?: number
    ) {
        return this.projectTagService.findSimilarProjects(
            projectId,
            limit ? Number(limit) : 5
        );
    }

    @Get('count/project/:id')
    @ApiOperation({ summary: 'Count tags for a specific project' })
    @ApiParam({ name: 'id', description: 'Project ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tag count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number', example: 5 }
            }
        }
    })
    async countByProject(@Param('id') projectId: string) {
        const count = await this.projectTagService.countByProject(projectId);
        return { count };
    }

    @Get('count/tag/:id')
    @ApiOperation({ summary: 'Count projects for a specific tag' })
    @ApiParam({ name: 'id', description: 'Tag ID' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Project count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: { type: 'number', example: 12 }
            }
        }
    })
    async countByTag(@Param('id') tagId: string) {
        const count = await this.projectTagService.countByTag(tagId);
        return { count };
    }
}
