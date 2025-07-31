import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TeamUserController } from './team-users.controller';
import { TeamUserService } from './team-users.service';

@Module({
    controllers: [TeamUserController],
    providers: [TeamUserService, PrismaClient], // ✅ لازم PrismaClient يكون هنا
})
export class TeamUsersModule {}
