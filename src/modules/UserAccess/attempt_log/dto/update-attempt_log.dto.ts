import { PartialType } from '@nestjs/swagger';
import { CreateAttemptLogDto } from './create-attempt_log.dto';

export class UpdateAttemptLogDto extends PartialType(CreateAttemptLogDto) {}
