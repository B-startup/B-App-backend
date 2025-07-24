import { Module } from '@nestjs/common';
import { ConnectService } from './connect.service';
import { ConnectController } from './connect.controller';

@Module({
  controllers: [ConnectController],
  providers: [ConnectService],
})
export class ConnectModule {}
