import { Injectable } from '@nestjs/common';
import { CreateProjectTagDto } from './dto/create-project-tag.dto';
import { UpdateProjectTagDto } from './dto/update-project-tag.dto';

@Injectable()
export class ProjectTagService {
  create(createProjectTagDto: CreateProjectTagDto) {
    return 'This action adds a new projectTag';
  }

  findAll() {
    return `This action returns all projectTag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} projectTag`;
  }

  update(id: number, updateProjectTagDto: UpdateProjectTagDto) {
    return `This action updates a #${id} projectTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} projectTag`;
  }
}
