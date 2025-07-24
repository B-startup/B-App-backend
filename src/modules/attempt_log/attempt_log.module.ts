import { Module } from '@nestjs/common';
import { AttemptLogService } from './attempt_log.service';
import { AttemptLogController } from './attempt_log.controller';

@Module({
  controllers: [AttemptLogController],
  providers: [AttemptLogService],
})
export class AttemptLogModule {}
