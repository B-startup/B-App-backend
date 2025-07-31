import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../../../core/services/prisma.service';
import { TokenBlacklistService } from '../../../core/services/token-blacklist.service';
import { FileUploadService } from 'src/modules/ProjectManagement/file-upload/file-upload.service';
import { UserModule } from '../user/user.module';
import { SecurityModule } from '../../../core/common/security.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
    imports: [
        ConfigModule,
        UserModule,
        SecurityModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET', 'secret'),
                signOptions: { expiresIn: '1d' }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, PrismaService, TokenBlacklistService, FileUploadService],
    exports: [AuthService, TokenBlacklistService]
})
export class AuthModule {}
