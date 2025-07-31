import { Injectable } from '@nestjs/common';
import { Sector, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Injectable()
export class SectorService extends BaseCrudServiceImpl<
    Sector,
    CreateSectorDto,
    UpdateSectorDto
> {
    protected model = this.prisma.sector;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }
}
