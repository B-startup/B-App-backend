import { PartialType } from '@nestjs/swagger';
import { CreateConnectDto } from './create-connect.dto';

export class UpdateConnectDto extends PartialType(CreateConnectDto) {}
