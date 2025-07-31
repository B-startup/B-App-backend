import { Injectable } from '@nestjs/common';
import { Offer, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OfferService extends BaseCrudServiceImpl<
    Offer,
    CreateOfferDto,
    UpdateOfferDto
> {
    protected model = this.prisma.offer;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Offer> {
        return this.model.delete({ where: { id } });
    }
}
