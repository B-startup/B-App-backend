import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { SecurityModule } from 'src/core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [MessageController],
    providers: [MessageService, PrismaService],
    exports: [MessageService]
})
export class MessageModule {}
