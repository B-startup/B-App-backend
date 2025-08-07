import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { CounterService } from '../../../core/common/services/counter.service';
import { LikeModule } from '../like/like.module';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [LikeModule, SecurityModule],
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
