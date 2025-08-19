import { Module } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { DiscussionController } from './discussion.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { SecurityModule } from 'src/core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [DiscussionController],
    providers: [DiscussionService, PrismaService],
    exports: [DiscussionService]
})
export class DiscussionModule {}
