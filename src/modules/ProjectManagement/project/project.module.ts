import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule, ConfigModule],
    controllers: [ProjectController],
    providers: [ProjectService, PrismaClient]
})
export class ProjectModule {}
