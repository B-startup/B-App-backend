import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/core/services/prisma.service';
import { SecurityModule } from '../../../core/common/security.module';
@Module({
    imports: [ConfigModule, SecurityModule, MailerModule],
    controllers: [UserController],
    providers: [UserService, PrismaService],
    exports: [UserService]
})
export class UserModule {}
