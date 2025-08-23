import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UploadedFile,
    UseInterceptors,
    Req
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody
} from '@nestjs/swagger';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) {}

    @TokenProtected()
    @Post()
    @UseInterceptors(FileInterceptor('logoImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create a new project' })
    @ApiBody({
        description: 'Project creation data',
        schema: {
            type: 'object',
            properties: {
                creatorId: { type: 'string', example: '26262626' },
                title: { type: 'string', example: 'EcoStartup' },
                description: { type: 'string', example: 'An app to reduce food waste' },
                problem: { type: 'string', example: 'Food waste in households and restaurants' },
                solution: { type: 'string', example: 'Mobile app with AI to track expiry dates' },
                projectLocation: { type: 'string', example: 'Tunis, Tunisia' },
                teamSize: { type: 'integer', example: 5 },
                teamId: { type: 'string', example: 'team-uuid-456' },
                customersNumber: { type: 'integer', example: 150 },
                financialGoal: { type: 'number', example: 50000 },
                monthlyRevenue: { type: 'number', example: 3000 },
                minPercentage: { type: 'integer', example: 5 },
                maxPercentage: { type: 'integer', example: 15 },
                percentageUnitPrice: { type: 'number', example: 1000 },
                sectorId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                status: { type: 'string', enum: ['DRAFT', 'PUBLIC'], example: 'DRAFT' },
                runway: { type: 'string', example: '2025-12-31T00:00:00.000Z' },
                marketPlan: { type: 'string', example: 'marketing-plan.pdf' },
                businessPlan: { type: 'string', example: 'business-plan.pdf' },
                successProbability: { type: 'number', example: 0.75 },
                projectStage: { type: 'string', enum: ['PRE_SEED', 'SEED', 'SERIE_A', 'SERIE_B'], example: 'SEED' },
                netProfit: { type: 'number', example: 25 },
                logoImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Project logo image file (JPEG, PNG, GIF, WebP max 2MB)'
                }
            },
            required: ['creatorId', 'title']
        }
    })
    @ApiResponse({ status: 201, description: 'Project created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid project data' })
    create(
        @Body() dto: CreateProjectDto,
        @UploadedFile() logoImage?: Express.Multer.File
    ) {
        return this.projectService.createWithLogo(dto, logoImage);
    }

    @Get()
    @ApiOperation({ summary: 'Get all projects' })
    @ApiResponse({ status: 200, description: 'List of all projects returned' })
    findAll() {
        return this.projectService.findAllOptimized();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search projects by keyword' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    search(@Query('q') keyword: string) {
        return this.projectService.searchProjectsOptimized(keyword);
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated list of projects' })
    @ApiResponse({ status: 200, description: 'Paginated projects returned' })
    paginate(@Query('skip') skip = 0, @Query('take') take = 10) {
        return this.projectService.paginateOptimized(Number(skip), Number(take));
    }


    @TokenProtected()
    @Get('my-projects')
    @ApiOperation({ summary: 'Get current user projects' })
    @ApiResponse({ status: 200, description: 'User projects returned' })
    getMyProjects(@Req() req: any) {
        const userId = req.user.id;
        return this.projectService.findByCreatorOptimized(userId);
    }

 
    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiResponse({ status: 200, description: 'Project found' })
    @ApiNotFoundResponse({ description: 'Project not found' })
    findOne(@Param('id') id: string) {
        return this.projectService.findOneOptimized(id);
    }

    @TokenProtected()
    @Patch(':id')
    @UseInterceptors(FileInterceptor('logoImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Update project by ID with optional logo' })
    @ApiBody({
        description: 'Project update data with optional logo image',
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'EcoStartup Updated' },
                description: { type: 'string', example: 'An improved app to reduce food waste' },
                problem: { type: 'string', example: 'Food waste in households and restaurants' },
                solution: { type: 'string', example: 'Mobile app with enhanced AI to track expiry dates' },
                projectLocation: { type: 'string', example: 'Tunis, Tunisia' },
                teamSize: { type: 'integer', example: 5 },
                teamId: { type: 'string', example: 'team-uuid-456' },
                customersNumber: { type: 'integer', example: 200 },
                financialGoal: { type: 'number', example: 75000 },
                monthlyRevenue: { type: 'number', example: 7500 },
                minPercentage: { type: 'integer', example: 5 },
                maxPercentage: { type: 'integer', example: 15 },
                percentageUnitPrice: { type: 'number', example: 1200 },
                sectorId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                status: { type: 'string', enum: ['DRAFT', 'PUBLIC'], example: 'PUBLIC' },
                runway: { type: 'string', example: '2025-12-31T00:00:00.000Z' },
                marketPlan: { type: 'string', example: 'updated-marketing-plan.pdf' },
                businessPlan: { type: 'string', example: 'updated-business-plan.pdf' },
                successProbability: { type: 'number', example: 0.85 },
                projectStage: { type: 'string', enum: ['PRE_SEED', 'SEED', 'SERIE_A', 'SERIE_B'], example: 'SERIE_A' },
                netProfit: { type: 'number', example: 30 },
                logoImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'New project logo image file (JPEG, PNG, GIF, WebP max 2MB) - will replace existing logo'
                }
            }
        }
    })
    @ApiResponse({ status: 200, description: 'Project updated successfully' })
    @ApiNotFoundResponse({ description: 'Project not found' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    update(
        @Param('id') id: string, 
        @Body() dto: UpdateProjectDto,
        @UploadedFile() logoImage?: Express.Multer.File
    ) {
        return this.projectService.updateWithLogo(id, dto, logoImage);
    }

    @TokenProtected()
    @Delete(':id/logo')
    @ApiOperation({ summary: 'Remove project logo' })
    @ApiResponse({ status: 200, description: 'Project logo removed successfully' })
    @ApiNotFoundResponse({ description: 'Project not found' })
    removeLogo(@Param('id') id: string) {
        return this.projectService.removeLogo(id);
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
