import { Module } from '@nestjs/common';
import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [OfferController],
    providers: [OfferService, PrismaClient]
})
export class OfferModule {}
