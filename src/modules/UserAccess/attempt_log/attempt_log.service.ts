import { Injectable } from '@nestjs/common';
import { PrismaClient, Attempt_log } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateAttemptLogDto } from './dto/create-attempt_log.dto';
import { UpdateAttemptLogDto } from './dto/update-attempt_log.dto';

@Injectable()
export class AttemptLogService extends BaseCrudServiceImpl<
    Attempt_log,
    CreateAttemptLogDto,
    UpdateAttemptLogDto
> {
    protected model = this.prisma.attempt_log;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Attempt_log> {
        return this.model.delete({ where: { id } });
    }
}
