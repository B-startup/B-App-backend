import { PartialType } from '@nestjs/swagger';
import { CreateUseOfFundDto } from './create-use-of-fund.dto';

export class UpdateUseOfFundDto extends PartialType(CreateUseOfFundDto) {}
