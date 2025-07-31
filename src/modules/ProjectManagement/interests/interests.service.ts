import { Injectable } from '@nestjs/common';
import { PrismaClient, Interests } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

@Injectable()
export class InterestsService extends BaseCrudServiceImpl<
    Interests,
    CreateInterestDto,
    UpdateInterestDto
> {
    protected model = this.prisma.interests;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Interests> {
        return this.model.delete({ where: { id } });
    }
}
