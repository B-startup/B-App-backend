import { Injectable } from '@nestjs/common';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';

@Injectable()
export class DiscussionService {
    create(_createDiscussionDto: CreateDiscussionDto) {
        return 'This action adds a new discussion';
    }

    findAll() {
        return `This action returns all discussion`;
    }

    findOne(id: number) {
        return `This action returns a #${id} discussion`;
    }

    update(id: number, _updateDiscussionDto: UpdateDiscussionDto) {
        return `This action updates a #${id} discussion`;
    }

    remove(id: number) {
        return `This action removes a #${id} discussion`;
    }
}
