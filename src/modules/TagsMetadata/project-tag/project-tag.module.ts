import { Module } from '@nestjs/common';
import { ProjectTagService } from './project-tag.service';
import { ProjectTagController } from './project-tag.controller';
import { PrismaService } from '../../../core/services/prisma.service';

@Module({
  controllers: [ProjectTagController],
  providers: [ProjectTagService, PrismaService],
  exports: [ProjectTagService]
})

@Module({
    controllers: [ProjectTagController],
    providers: [ProjectTagService]
})
export class ProjectTagModule {}
