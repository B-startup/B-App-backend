import { Module } from '@nestjs/common';
import { PostSharedService } from './post-shared.service';
import { PostSharedController } from './post-shared.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [PostSharedController],
    providers: [PostSharedService, PrismaClient],
    exports: [PostSharedService]
})
export class PostSharedModule {}
