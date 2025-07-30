import { Module } from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import { PostTagController } from './post-tag.controller';
import { PrismaService } from '../../../core/services/prisma.service';

@Module({
    controllers: [PostTagController],
    providers: [PostTagService, PrismaService],
    exports: [PostTagService]
})
export class PostTagModule {}
