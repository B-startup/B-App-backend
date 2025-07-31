import { Injectable } from '@nestjs/common';
import { PrismaClient, Block } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class BlockService extends BaseCrudServiceImpl<
    Block,
    CreateBlockDto,
    UpdateBlockDto
> {
    protected model = this.prisma.block;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Block> {
        return this.model.delete({ where: { id } });
    }
}
