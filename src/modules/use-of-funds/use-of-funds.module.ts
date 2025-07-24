import { Module } from '@nestjs/common';
import { UseOfFundsService } from './use-of-funds.service';
import { UseOfFundsController } from './use-of-funds.controller';

@Module({
  controllers: [UseOfFundsController],
  providers: [UseOfFundsService],
})
export class UseOfFundsModule {}
