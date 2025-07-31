import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { CounterService } from '../../../core/common/services/counter.service';

@Module({
    controllers: [CommentController],
    providers: [
        CommentService, 
        PrismaService,
        {
            provide: CounterService,
            useFactory: (prisma: PrismaService) => new CounterService(prisma),
            inject: [PrismaService]
        }
    ],
    exports: [CommentService]
})
export class CommentModule {}
