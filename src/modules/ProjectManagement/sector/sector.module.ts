import { Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [SectorController],
    providers: [SectorService, PrismaClient]
})
export class SectorModule {}
