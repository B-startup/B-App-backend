import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TeamUsersService } from './team-users.service';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { UpdateTeamUserDto } from './dto/update-team-user.dto';

@Controller('team-users')
export class TeamUsersController {
  constructor(private readonly teamUsersService: TeamUsersService) {}

  @Post()
  create(@Body() createTeamUserDto: CreateTeamUserDto) {
    return this.teamUsersService.create(createTeamUserDto);
  }

  @Get()
  findAll() {
    return this.teamUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamUsersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamUserDto: UpdateTeamUserDto) {
    return this.teamUsersService.update(+id, updateTeamUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamUsersService.remove(+id);
  }
}
