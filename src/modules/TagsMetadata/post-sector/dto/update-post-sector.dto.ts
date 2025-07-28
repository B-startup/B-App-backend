import { PartialType } from '@nestjs/swagger';
import { CreatePostSectorDto } from './create-post-sector.dto';

export class UpdatePostSectorDto extends PartialType(CreatePostSectorDto) {}
