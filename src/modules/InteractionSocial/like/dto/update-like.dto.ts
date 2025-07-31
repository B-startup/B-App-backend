import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLikeDto } from './create-like.dto';

export class UpdateLikeDto extends PartialType(
    OmitType(CreateLikeDto, ['userId'] as const)
) {}
