import { Injectable } from '@nestjs/common';
import { CreatePostSharedDto } from './dto/create-post-shared.dto';
import { UpdatePostSharedDto } from './dto/update-post-shared.dto';

@Injectable()
export class PostSharedService {
    create(createPostSharedDto: CreatePostSharedDto) {
        return 'This action adds a new postShared';
    }

    findAll() {
        return `This action returns all postShared`;
    }

    findOne(id: number) {
        return `This action returns a #${id} postShared`;
    }

    update(id: number, updatePostSharedDto: UpdatePostSharedDto) {
        return `This action updates a #${id} postShared`;
    }

    remove(id: number) {
        return `This action removes a #${id} postShared`;
    }
}
