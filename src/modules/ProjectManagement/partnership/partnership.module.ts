import { Module } from '@nestjs/common';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';

@Module({
    controllers: [PartnershipController],
    providers: [PartnershipService]
})
export class PartnershipModule {}
