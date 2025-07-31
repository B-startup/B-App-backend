import { Module } from '@nestjs/common';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [PartnershipController],
    providers: [PartnershipService, PrismaClient],
    exports: [PartnershipService]
})
export class PartnershipModule {}
