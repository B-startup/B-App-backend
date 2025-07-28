import { Module } from '@nestjs/common';
import { ExperienceEducationService } from './experience_education.service';
import { ExperienceEducationController } from './experience_education.controller';

@Module({
    controllers: [ExperienceEducationController],
    providers: [ExperienceEducationService]
})
export class ExperienceEducationModule {}
