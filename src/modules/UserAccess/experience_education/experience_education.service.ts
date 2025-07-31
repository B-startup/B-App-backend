import { Injectable } from '@nestjs/common';
import { PrismaClient, Experience_Education } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateExperienceEducationDto } from './dto/create-experience_education.dto';
import { UpdateExperienceEducationDto } from './dto/update-experience_education.dto';

@Injectable()
export class ExperienceEducationService extends BaseCrudServiceImpl<
    Experience_Education,
    CreateExperienceEducationDto,
    UpdateExperienceEducationDto
> {
    protected model = this.prisma.experience_Education;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<Experience_Education> {
        return this.model.delete({ where: { id } });
    }
}
