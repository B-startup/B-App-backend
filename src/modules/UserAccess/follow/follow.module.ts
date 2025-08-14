import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';

@Module({
    imports: [SecurityModule],
    controllers: [FollowController],
    providers: [FollowService, PrismaClient],
    exports: [FollowService],
})
export class FollowModule {}
