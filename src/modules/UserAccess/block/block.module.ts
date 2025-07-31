import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [BlockController],
    providers: [BlockService, PrismaClient]
})
export class BlockModule {}
