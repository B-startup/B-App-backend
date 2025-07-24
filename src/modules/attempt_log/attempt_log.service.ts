import { Injectable } from '@nestjs/common';
import { CreateAttemptLogDto } from './dto/create-attempt_log.dto';
import { UpdateAttemptLogDto } from './dto/update-attempt_log.dto';

@Injectable()
export class AttemptLogService {
  create(createAttemptLogDto: CreateAttemptLogDto) {
    return 'This action adds a new attemptLog';
  }

  findAll() {
    return `This action returns all attemptLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attemptLog`;
  }

  update(id: number, updateAttemptLogDto: UpdateAttemptLogDto) {
    return `This action updates a #${id} attemptLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} attemptLog`;
  }
}
