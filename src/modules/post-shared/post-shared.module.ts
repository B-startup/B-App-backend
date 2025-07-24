import { Module } from '@nestjs/common';
import { PostSharedService } from './post-shared.service';
import { PostSharedController } from './post-shared.controller';

@Module({
  controllers: [PostSharedController],
  providers: [PostSharedService],
})
export class PostSharedModule {}
