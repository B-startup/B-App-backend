import { Injectable } from '@nestjs/common';
import { CreateVisitorProfileProjectDto } from './dto/create-visitor-profile-project.dto';
import { UpdateVisitorProfileProjectDto } from './dto/update-visitor-profile-project.dto';

@Injectable()
export class VisitorProfileProjectService {
    create(createVisitorProfileProjectDto: CreateVisitorProfileProjectDto) {
        return 'This action adds a new visitorProfileProject';
    }

    findAll() {
        return `This action returns all visitorProfileProject`;
    }

    findOne(id: number) {
        return `This action returns a #${id} visitorProfileProject`;
    }

    update(
        id: number,
        updateVisitorProfileProjectDto: UpdateVisitorProfileProjectDto
    ) {
        return `This action updates a #${id} visitorProfileProject`;
    }

    remove(id: number) {
        return `This action removes a #${id} visitorProfileProject`;
    }
}
