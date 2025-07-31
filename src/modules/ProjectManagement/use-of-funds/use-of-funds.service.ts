import { Injectable } from '@nestjs/common';
import { UseOfFunds, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateUseOfFundsDto } from './dto/create-use-of-fund.dto';
import { UpdateUseOfFundDto } from './dto/update-use-of-fund.dto';

@Injectable()
export class UseOfFundsService extends BaseCrudServiceImpl<
    UseOfFunds,
    CreateUseOfFundsDto,
    UpdateUseOfFundDto
> {
    protected model = this.prisma.useOfFunds;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<UseOfFunds> {
        return this.model.delete({ where: { id } });
    }
}
