import { PartialType } from '@nestjs/swagger';
import { CreateUseOfFundsDto } from './create-use-of-fund.dto';

export class UpdateUseOfFundDto extends PartialType(CreateUseOfFundsDto) {}
