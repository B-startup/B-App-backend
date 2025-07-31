import { Module } from '@nestjs/common';
import { CounterController } from './controllers/counter.controller';
import { PrismaService } from '../../core/services/prisma.service';

@Module({
    controllers: [CounterController],
    providers: [PrismaService],
    exports: []
})
export class CounterModule {}
