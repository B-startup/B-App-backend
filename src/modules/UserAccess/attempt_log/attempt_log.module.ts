import { Module } from '@nestjs/common';
import { AttemptLogService } from './attempt_log.service';
import { AttemptLogController } from './attempt_log.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [AttemptLogController],
    providers: [AttemptLogService, PrismaClient]
})
export class AttemptLogModule {}
