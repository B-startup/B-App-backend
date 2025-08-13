import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [InterestsController],
    providers: [InterestsService, PrismaClient]
})
export class InterestsModule {}
