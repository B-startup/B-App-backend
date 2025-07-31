import { Injectable } from '@nestjs/common';
import { Team, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService extends BaseCrudServiceImpl<
    Team,
    CreateTeamDto,
    UpdateTeamDto
> {
    protected model = this.prisma.team;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Team> {
        return this.model.delete({ where: { id } });
    }
}
