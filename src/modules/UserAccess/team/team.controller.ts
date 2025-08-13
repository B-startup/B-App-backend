import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { Team } from '@prisma/client';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a new team' })
    @ApiCreatedResponse({ description: 'Team created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid input' })
    create(@Body() dto: CreateTeamDto): Promise<Team> {
        return this.teamService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all teams' })
    @ApiOkResponse({ description: 'List of teams returned' })
    findAll(): Promise<Team[]> {
        return this.teamService.findAll();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search teams by name or description' })
    findBy(@Query('q') keyword: string): Promise<Team[]> {
        return this.teamService.search(keyword, ['name', 'description']);
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated teams' })
    paginate(
        @Query('skip') skip = 0,
        @Query('take') take = 10
    ): Promise<Team[]> {
        return this.teamService.paginate(Number(skip), Number(take));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get team by ID' })
    @ApiOkResponse({ description: 'Team found' })
    @ApiNotFoundResponse({ description: 'Team not found' })
    findOne(@Param('id') id: string): Promise<Team> {
        return this.teamService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update team by ID' })
    @ApiOkResponse({ description: 'Team updated' })
    update(@Param('id') id: string, @Body() dto: UpdateTeamDto): Promise<Team> {
        return this.teamService.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete team by ID' })
    @ApiOkResponse({ description: 'Team deleted' })
    remove(@Param('id') id: string): Promise<Team> {
        return this.teamService.remove(id);
    }
}
