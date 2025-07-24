import { PartialType } from '@nestjs/swagger';
import { CreatePostSharedDto } from './create-post-shared.dto';

export class UpdatePostSharedDto extends PartialType(CreatePostSharedDto) {}
