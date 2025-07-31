import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConnectService } from './connect.service';
import { ConnectController } from './connect.controller';

@Module({
    controllers: [ConnectController],
    providers: [ConnectService, PrismaClient]
})
export class ConnectModule {}
