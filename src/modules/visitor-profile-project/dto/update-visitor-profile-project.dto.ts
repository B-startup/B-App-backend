import { PartialType } from '@nestjs/swagger';
import { CreateVisitorProfileProjectDto } from './create-visitor-profile-project.dto';

export class UpdateVisitorProfileProjectDto extends PartialType(CreateVisitorProfileProjectDto) {}
