import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [TagController],
    providers: [TagService, PrismaClient],
    exports: [TagService]
})
export class TagModule {}
