import { Module } from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import { PostTagController } from './post-tag.controller';

@Module({
  controllers: [PostTagController],
  providers: [PostTagService],
})
export class PostTagModule {}
