import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [TeamController],
    providers: [TeamService, PrismaClient]
})
export class TeamModule {}
