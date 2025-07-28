import { PartialType } from '@nestjs/swagger';
import { CreatePostTagDto } from './create-post-tag.dto';

export class UpdatePostTagDto extends PartialType(CreatePostTagDto) {}
