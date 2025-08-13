import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TeamUserController } from './team-users.controller';
import { TeamUserService } from './team-users.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [TeamUserController],
    providers: [TeamUserService, PrismaClient]
})
export class TeamUsersModule {}
