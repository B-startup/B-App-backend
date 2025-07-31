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
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';

@ApiTags('Tags')
@Controller('tag')
export class TagController {
    constructor(private readonly tagService: TagService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new tag' })
    @ApiBody({
        type: CreateTagDto,
        schema: {
            example: {
                name: "Fintech",
                description: "Financial technology related posts and projects"
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Tag created successfully',
        type: TagResponseDto,
        schema: {
            example: {
                id: "uuid-string",
                name: "Fintech",
                description: "Financial technology related posts and projects",
                createdAt: "2025-07-30T10:30:00.000Z",
                updatedAt: "2025-07-30T10:30:00.000Z"
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Tag name already exists' })
    async create(@Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
        return await this.tagService.createTag(createTagDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all tags' })
    @ApiQuery({
        name: 'withUsageCount',
        required: false,
        type: Boolean,
        description: 'Include usage count (projects + posts)'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search tags by name'
    })
    @ApiResponse({
        status: 200,
        description: 'Tags retrieved successfully',
        type: [TagResponseDto]
    })
    async findAll(
        @Query('withUsageCount') withUsageCount?: boolean,
        @Query('search') search?: string
    ) {
        if (search) {
            return await this.tagService.searchByName(search);
        }

        if (withUsageCount === true) {
            return await this.tagService.findAllWithUsageCount();
        }

        return await this.tagService.findAll();
    }

    @Get('most-used')
    @ApiOperation({ summary: 'Get most used tags' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of tags to return (default: 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Most used tags retrieved successfully'
    })
    async findMostUsed(
        @Query('limit') limit?: string
    ) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return await this.tagService.findMostUsedTags(limitNumber);
    }

    @Get('project-tags')
    @ApiOperation({ summary: 'Get all tags used in projects' })
    @ApiResponse({
        status: 200,
        description: 'Project tags retrieved successfully',
        type: [TagResponseDto]
    })
    async findProjectTags() {
        return await this.tagService.findProjectTags();
    }

    @Get('post-tags')
    @ApiOperation({ summary: 'Get all tags used in posts' })
    @ApiResponse({
        status: 200,
        description: 'Post tags retrieved successfully',
        type: [TagResponseDto]
    })
    async findPostTags() {
        return await this.tagService.findPostTags();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get tag by ID' })
    @ApiParam({ name: 'id', description: 'Tag ID' })
    @ApiResponse({
        status: 200,
        description: 'Tag found',
        type: TagResponseDto
    })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    async findOne(@Param('id') id: string): Promise<TagResponseDto> {
        return await this.tagService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update tag by ID' })
    @ApiParam({ name: 'id', description: 'Tag ID' })
    @ApiBody({ type: UpdateTagDto })
    @ApiResponse({
        status: 200,
        description: 'Tag updated successfully',
        type: TagResponseDto
    })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    @ApiResponse({ status: 409, description: 'Tag name already exists' })
    async update(
        @Param('id') id: string,
        @Body() updateTagDto: UpdateTagDto
    ): Promise<TagResponseDto> {
        return await this.tagService.updateTag(id, updateTagDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete tag by ID' })
    @ApiParam({ name: 'id', description: 'Tag ID' })
    @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
    @ApiResponse({ status: 404, description: 'Tag not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.tagService.remove(id);
    }
}
