import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostMediaService } from './post-media.service';
import { PostMediaController } from './post-media.controller';
import { PostMediaFileService } from './post-media-file.service';
import { PrismaService } from '../../../core/services/prisma.service';

@Module({
    imports: [ConfigModule],
    controllers: [PostMediaController],
    providers: [
        PostMediaService, 
        PostMediaFileService, 
        PrismaService
    ],
    exports: [PostMediaService, PostMediaFileService]
})
export class PostMediaModule {}
