import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';
import { TeamUsers } from '@prisma/client';
import { TeamUserService } from './team-users.service';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { UpdateTeamUserDto } from './dto/update-team-user.dto';

@ApiTags('TeamUsers')
@Controller('team-users')
export class TeamUserController {
    constructor(private readonly teamUserService: TeamUserService) {}

    @Post()
    @ApiOperation({ summary: 'Add a user to a team' })
    @ApiCreatedResponse({ description: 'User added to team successfully' })
    @ApiBadRequestResponse({
        description: 'User already in team or invalid data'
    })
    create(@Body() dto: CreateTeamUserDto): Promise<TeamUsers> {
        return this.teamUserService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all team-user links' })
    @ApiOkResponse({ description: 'List of all team-user entries' })
    findAll(): Promise<TeamUsers[]> {
        return this.teamUserService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a team-user link by ID' })
    @ApiOkResponse({ description: 'Team-user entry found' })
    findOne(@Param('id') id: string): Promise<TeamUsers> {
        return this.teamUserService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update team-user link' })
    @ApiOkResponse({ description: 'Team-user link updated' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateTeamUserDto
    ): Promise<TeamUsers> {
        return this.teamUserService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remove a user from a team' })
    @ApiOkResponse({ description: 'User removed from team' })
    remove(@Param('id') id: string): Promise<TeamUsers> {
        return this.teamUserService.remove(id);
    }
}
