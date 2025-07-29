import { Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [SectorController],
    providers: [SectorService, PrismaClient]
})
export class SectorModule {}
