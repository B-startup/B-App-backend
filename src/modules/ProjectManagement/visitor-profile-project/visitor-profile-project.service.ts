import { Injectable } from '@nestjs/common';
import { PrismaClient, VisitorProfileProject } from '@prisma/client';
import { BaseCrudServiceImpl } from 'src/core/common/services/base-crud.service';
import { CreateVisitorProfileProjectDto } from './dto/create-visitor-profile-project.dto';
import { UpdateVisitorProfileProjectDto } from './dto/update-visitor-profile-project.dto';

@Injectable()
export class VisitorProfileProjectService extends BaseCrudServiceImpl<
    VisitorProfileProject,
    CreateVisitorProfileProjectDto,
    UpdateVisitorProfileProjectDto
> {
    protected model = this.prisma.visitorProfileProject;

    constructor(protected override prisma: PrismaClient) {
        super(prisma);
    }

    override async remove(id: string): Promise<VisitorProfileProject> {
        return this.model.delete({ where: { id } });
    }
}
