import { Module } from '@nestjs/common';
import { ProjectTagService } from './project-tag.service';
import { ProjectTagController } from './project-tag.controller';

@Module({
  controllers: [ProjectTagController],
  providers: [ProjectTagService],
})
export class ProjectTagModule {}
