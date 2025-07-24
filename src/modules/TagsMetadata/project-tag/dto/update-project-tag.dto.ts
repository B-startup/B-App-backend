import { PartialType } from '@nestjs/swagger';
import { CreateProjectTagDto } from './create-project-tag.dto';

export class UpdateProjectTagDto extends PartialType(CreateProjectTagDto) {}
