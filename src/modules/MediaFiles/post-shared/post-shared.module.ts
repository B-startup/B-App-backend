import { Module } from '@nestjs/common';
import { PostSharedService } from './post-shared.service';
import { PostSharedController } from './post-shared.controller';
import { PrismaService } from '../../../core/services/prisma.service';

@Module({
    controllers: [PostSharedController],
    providers: [PostSharedService, PrismaService],
    exports: [PostSharedService]
})
export class PostSharedModule {}
