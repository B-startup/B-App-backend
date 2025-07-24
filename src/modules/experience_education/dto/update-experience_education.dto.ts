import { PartialType } from '@nestjs/swagger';
import { CreateExperienceEducationDto } from './create-experience_education.dto';

export class UpdateExperienceEducationDto extends PartialType(CreateExperienceEducationDto) {}
