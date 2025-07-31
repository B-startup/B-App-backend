import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { CounterService } from '../../../core/common/services/counter.service';

@Module({
    controllers: [LikeController],
    providers: [
        LikeService, 
        PrismaService,
        {
            provide: CounterService,
            useFactory: (prisma: PrismaService) => new CounterService(prisma),
            inject: [PrismaService]
        }
    ],
    exports: [LikeService]
})
export class LikeModule {}
