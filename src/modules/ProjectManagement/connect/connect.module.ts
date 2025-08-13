import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConnectService } from './connect.service';
import { ConnectController } from './connect.controller';
import { SecurityModule } from 'src/core/common/security.module';

@Module({
    imports: [ SecurityModule],
    controllers: [ConnectController],
    providers: [ConnectService, PrismaClient]
})
export class ConnectModule {}
