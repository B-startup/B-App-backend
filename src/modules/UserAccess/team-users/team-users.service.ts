import { Injectable } from '@nestjs/common';
import { PrismaClient, TeamUsers } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { UpdateTeamUserDto } from './dto/update-team-user.dto';

@Injectable()
export class TeamUserService extends BaseCrudServiceImpl<
    TeamUsers,
    CreateTeamUserDto,
    UpdateTeamUserDto
> {
    protected model = this.prisma.teamUsers;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<TeamUsers> {
        return this.model.delete({ where: { id } });
    }
}
