import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';

@Injectable()
export class FollowService {
    create(_createFollowDto: CreateFollowDto) {
        return 'This action adds a new follow';
    }

    findAll() {
        return `This action returns all follow`;
    }

    findOne(id: number) {
        return `This action returns a #${id} follow`;
    }

    update(id: number, _updateFollowDto: UpdateFollowDto) {
        return `This action updates a #${id} follow`;
    }

    remove(id: number) {
        return `This action removes a #${id} follow`;
    }
}
