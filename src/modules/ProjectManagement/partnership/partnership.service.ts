import { Injectable } from '@nestjs/common';
import { Partnership, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreatePartnershipDto } from './dto/create-partnership.dto';
import { UpdatePartnershipDto } from './dto/update-partnership.dto';

@Injectable()
export class PartnershipService extends BaseCrudServiceImpl<
    Partnership,
    CreatePartnershipDto,
    UpdatePartnershipDto
> {
    protected model = this.prisma.partnership;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Partnership> {
        return this.model.delete({ where: { id } });
    }
}
