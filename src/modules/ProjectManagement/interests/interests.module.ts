import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [InterestsController],
    providers: [InterestsService, PrismaClient]
})
export class InterestsModule {}
