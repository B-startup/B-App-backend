import { Module } from '@nestjs/common';
import { ProjectTagService } from './project-tag.service';
import { ProjectTagController } from './project-tag.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [ProjectTagController],
    providers: [ProjectTagService, PrismaClient],
    exports: [ProjectTagService]
})
export class ProjectTagModule {}
