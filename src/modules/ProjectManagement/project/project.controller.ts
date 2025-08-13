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
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    @ApiResponse({ status: 201, description: 'Project created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid project data' })
    create(@Body() dto: CreateProjectDto) {
        return this.projectService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects' })
    @ApiResponse({ status: 200, description: 'List of all projects returned' })
    findAll() {
        return this.projectService.findAll();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search projects by keyword' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    search(@Query('q') keyword: string) {
        return this.projectService.search(keyword, ['title', 'description']);
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated list of projects' })
    @ApiResponse({ status: 200, description: 'Paginated projects returned' })
    paginate(@Query('skip') skip = 0, @Query('take') take = 10) {
        return this.projectService.paginate(Number(skip), Number(take));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiResponse({ status: 200, description: 'Project found' })
    @ApiNotFoundResponse({ description: 'Project not found' })
    findOne(@Param('id') id: string) {
        return this.projectService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update project by ID' })
    @ApiResponse({ status: 200, description: 'Project updated successfully' })
    @ApiNotFoundResponse({ description: 'Project not found' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
        return this.projectService.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete project by ID' })
    @ApiResponse({ status: 204, description: 'Project deleted successfully' })
    @ApiNotFoundResponse({ description: 'Project not found' })
    remove(@Param('id') id: string) {
        return this.projectService.remove(id);
    }
}
