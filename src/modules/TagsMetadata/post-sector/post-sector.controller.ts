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
import { PostSectorService } from './post-sector.service';
import { CreatePostSectorDto } from './dto/create-post-sector.dto';
import { UpdatePostSectorDto } from './dto/update-post-sector.dto';
import { PostSectorResponseDto } from './dto/post-sector-response.dto';

@ApiTags('Post Sectors')
@Controller('post-sector')
export class PostSectorController {
    constructor(private readonly postSectorService: PostSectorService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new post-sector association' })
    @ApiBody({
        type: CreatePostSectorDto,
        schema: {
            example: {
                postId: "post-uuid-string",
                sectorId: "sector-uuid-string"
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Post-sector association created successfully',
        type: PostSectorResponseDto,
        schema: {
            example: {
                id: "uuid-string",
                postId: "post-uuid-string",
                sectorId: "sector-uuid-string",
                createdAt: "2025-07-30T10:30:00.000Z",
                updatedAt: "2025-07-30T10:30:00.000Z"
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Post or Sector not found' })
    @ApiResponse({ status: 409, description: 'Association already exists' })
    async create(@Body() createPostSectorDto: CreatePostSectorDto): Promise<PostSectorResponseDto> {
        return await this.postSectorService.createAssociation(createPostSectorDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all post-sector associations' })
    @ApiResponse({
        status: 200,
        description: 'Post-sector associations retrieved successfully',
        type: [PostSectorResponseDto]
    })
    async findAll(): Promise<PostSectorResponseDto[]> {
        return  this.postSectorService.findAll();
    }

    @Get('popular-sectors')
    @ApiOperation({ summary: 'Get popular sectors by post count' })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of sectors to return (default: 10)'
    })
    @ApiResponse({
        status: 200,
        description: 'Popular sectors retrieved successfully'
    })
    async findPopularSectors(
        @Query('limit') limit?: string
    ) {
        const limitNumber = limit ? parseInt(limit, 10) : 10;
        return await this.postSectorService.findPopularSectors(limitNumber);
    }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Get all sectors associated with a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiQuery({
        name: 'withSectors',
        required: false,
        type: Boolean,
        description: 'Include sector details'
    })
    @ApiResponse({
        status: 200,
        description: 'Post sectors retrieved successfully',
        type: [PostSectorResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async findByPost(
        @Param('postId') postId: string,
        @Query('withSectors') withSectors?: boolean
    ) {
        if (withSectors === true) {
            return await this.postSectorService.findByPostWithSectors(postId);
        }
        return await this.postSectorService.findByPost(postId);
    }

    @Get('sector/:sectorId')
    @ApiOperation({ summary: 'Get all posts associated with a sector' })
    @ApiParam({ name: 'sectorId', description: 'Sector ID' })
    @ApiQuery({
        name: 'withPosts',
        required: false,
        type: Boolean,
        description: 'Include post details'
    })
    @ApiResponse({
        status: 200,
        description: 'Sector posts retrieved successfully',
        type: [PostSectorResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Sector not found' })
    async findBySector(
        @Param('sectorId') sectorId: string,
        @Query('withPosts') withPosts?: boolean
    ) {
        if (withPosts === true) {
            return await this.postSectorService.findBySectorWithPosts(sectorId);
        }
        return await this.postSectorService.findBySector(sectorId);
    }

    @Get('count/post/:postId')
    @ApiOperation({ summary: 'Count sectors associated with a post' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiResponse({
        status: 200,
        description: 'Post sector count retrieved successfully',
        schema: {
            example: { count: 3 }
        }
    })
    async countByPost(@Param('postId') postId: string) {
        const count = await this.postSectorService.countByPost(postId);
        return { count };
    }

    @Get('count/sector/:sectorId')
    @ApiOperation({ summary: 'Count posts associated with a sector' })
    @ApiParam({ name: 'sectorId', description: 'Sector ID' })
    @ApiResponse({
        status: 200,
        description: 'Sector post count retrieved successfully',
        schema: {
            example: { count: 15 }
        }
    })
    async countBySector(@Param('sectorId') sectorId: string) {
        const count = await this.postSectorService.countBySector(sectorId);
        return { count };
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get post-sector association by ID' })
    @ApiParam({ name: 'id', description: 'Post-sector association ID' })
    @ApiResponse({
        status: 200,
        description: 'Post-sector association found',
        type: PostSectorResponseDto
    })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async findOne(@Param('id') id: string): Promise<PostSectorResponseDto> {
        return await this.postSectorService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update post-sector association by ID' })
    @ApiParam({ name: 'id', description: 'Post-sector association ID' })
    @ApiBody({ type: UpdatePostSectorDto })
    @ApiResponse({
        status: 200,
        description: 'Post-sector association updated successfully',
        type: PostSectorResponseDto
    })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async update(
        @Param('id') id: string,
        @Body() updatePostSectorDto: UpdatePostSectorDto
    ): Promise<PostSectorResponseDto> {
        return  this.postSectorService.update(id, updatePostSectorDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete post-sector association by ID' })
    @ApiParam({ name: 'id', description: 'Post-sector association ID' })
    @ApiResponse({ status: 204, description: 'Association deleted successfully' })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.postSectorService.remove(id);
    }

    @Delete('association/:postId/:sectorId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete specific post-sector association' })
    @ApiParam({ name: 'postId', description: 'Post ID' })
    @ApiParam({ name: 'sectorId', description: 'Sector ID' })
    @ApiResponse({ status: 204, description: 'Association deleted successfully' })
    @ApiResponse({ status: 404, description: 'Association not found' })
    async removeAssociation(
        @Param('postId') postId: string,
        @Param('sectorId') sectorId: string
    ): Promise<void> {
        await this.postSectorService.removeAssociation(postId, sectorId);
    }
}
