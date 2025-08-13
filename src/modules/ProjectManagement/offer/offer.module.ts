import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [OfferController],
    providers: [OfferService, PrismaClient]
})
export class OfferModule {}
