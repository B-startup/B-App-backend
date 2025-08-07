import { Module } from '@nestjs/common';
import { PostTagService } from './post-tag.service';
import { PostTagController } from './post-tag.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [PostTagController],
    providers: [PostTagService, PrismaClient],
    exports: [PostTagService]
})
export class PostTagModule {}
