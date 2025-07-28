import { Injectable } from '@nestjs/common';
import { CreateExperienceEducationDto } from './dto/create-experience_education.dto';
import { UpdateExperienceEducationDto } from './dto/update-experience_education.dto';

@Injectable()
export class ExperienceEducationService {
    create(createExperienceEducationDto: CreateExperienceEducationDto) {
        return 'This action adds a new experienceEducation';
    }

    findAll() {
        return `This action returns all experienceEducation`;
    }

    findOne(id: number) {
        return `This action returns a #${id} experienceEducation`;
    }

    update(
        id: number,
        updateExperienceEducationDto: UpdateExperienceEducationDto
    ) {
        return `This action updates a #${id} experienceEducation`;
    }

    remove(id: number) {
        return `This action removes a #${id} experienceEducation`;
    }
}
