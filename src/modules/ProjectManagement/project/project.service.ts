import { Injectable } from '@nestjs/common';
import { Project, PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService extends BaseCrudServiceImpl<
    Project,
    CreateProjectDto,
    UpdateProjectDto
> {
    protected model = this.prisma.project;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }
}
