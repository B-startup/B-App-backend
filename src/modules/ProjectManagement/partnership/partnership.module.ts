import { Module } from '@nestjs/common';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [PartnershipController],
    providers: [PartnershipService, PrismaClient],
    exports: [PartnershipService]
})
export class PartnershipModule {}
