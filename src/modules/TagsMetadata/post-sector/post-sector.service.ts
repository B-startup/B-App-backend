import { Injectable } from '@nestjs/common';
import { CreatePostSectorDto } from './dto/create-post-sector.dto';
import { UpdatePostSectorDto } from './dto/update-post-sector.dto';

@Injectable()
export class PostSectorService {
    create(createPostSectorDto: CreatePostSectorDto) {
        return 'This action adds a new postSector';
    }

    findAll() {
        return `This action returns all postSector`;
    }

    findOne(id: number) {
        return `This action returns a #${id} postSector`;
    }

    update(id: number, updatePostSectorDto: UpdatePostSectorDto) {
        return `This action updates a #${id} postSector`;
    }

    remove(id: number) {
        return `This action removes a #${id} postSector`;
    }
}
