import { Module } from '@nestjs/common';
import { ExperienceEducationService } from './experience_education.service';
import { ExperienceEducationController } from './experience_education.controller';
import { PrismaClient } from '@prisma/client';

@Module({
    controllers: [ExperienceEducationController],
    providers: [ExperienceEducationService, PrismaClient]
})
export class ExperienceEducationModule {}
