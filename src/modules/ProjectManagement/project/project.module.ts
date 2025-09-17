import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { PrismaClient } from '@prisma/client';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule, ConfigModule],
    controllers: [ProjectController],
    providers: [ProjectService, PrismaClient, CloudinaryService],
    exports: [ProjectService]
})
export class ProjectModule {}
