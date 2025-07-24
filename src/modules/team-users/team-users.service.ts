import { Injectable } from '@nestjs/common';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { UpdateTeamUserDto } from './dto/update-team-user.dto';

@Injectable()
export class TeamUsersService {
  create(createTeamUserDto: CreateTeamUserDto) {
    return 'This action adds a new teamUser';
  }

  findAll() {
    return `This action returns all teamUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teamUser`;
  }

  update(id: number, updateTeamUserDto: UpdateTeamUserDto) {
    return `This action updates a #${id} teamUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} teamUser`;
  }
}
