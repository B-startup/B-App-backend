import { Module } from '@nestjs/common';
import { ExperienceEducationService } from './experience_education.service';
import { ExperienceEducationController } from './experience_education.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [ExperienceEducationController],
    providers: [ExperienceEducationService, PrismaClient],
    exports: [ExperienceEducationService]
})
export class ExperienceEducationModule {}
