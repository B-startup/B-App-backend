import { Injectable } from '@nestjs/common';
import { PrismaClient, Connect } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateConnectDto } from './dto/create-connect.dto';
import { UpdateConnectDto } from './dto/update-connect.dto';

@Injectable()
export class ConnectService extends BaseCrudServiceImpl<
    Connect,
    CreateConnectDto,
    UpdateConnectDto
> {
    protected model = this.prisma.connect;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Connect> {
        return this.model.delete({ where: { id } });
    }
}
