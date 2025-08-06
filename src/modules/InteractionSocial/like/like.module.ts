import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { CounterService } from '../../../core/common/services/counter.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
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
