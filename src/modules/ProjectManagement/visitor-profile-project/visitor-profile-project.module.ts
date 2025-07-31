import { Module } from '@nestjs/common';
import { VisitorProfileProjectService } from './visitor-profile-project.service';
import { VisitorProfileProjectController } from './visitor-profile-project.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [VisitorProfileProjectController],
    providers: [VisitorProfileProjectService, PrismaClient]
})
export class VisitorProfileProjectModule {}
