import { Module } from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import { PostTagController } from './post-tag.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [PostTagController],
    providers: [PostTagService, PrismaClient],
    exports: [PostTagService]
})
export class PostTagModule {}
