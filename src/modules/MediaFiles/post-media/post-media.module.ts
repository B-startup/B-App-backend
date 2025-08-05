import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostMediaService } from './post-media.service';
import { PostMediaController } from './post-media.controller';
import { PostMediaFileService } from './post-media-file.service';
import { PrismaClient } from '@prisma/client';

@Module({
    imports: [ConfigModule],
    controllers: [PostMediaController],
    providers: [PostMediaService, PostMediaFileService, PrismaClient],
    exports: [PostMediaService, PostMediaFileService]
})
export class PostMediaModule {}
