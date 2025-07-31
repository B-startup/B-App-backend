import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
    controllers: [TeamController],
    providers: [TeamService, PrismaClient]
})
export class TeamModule {}
