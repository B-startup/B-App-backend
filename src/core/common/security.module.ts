import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../services/prisma.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { TokenCleanupService } from '../services/token-cleanup.service';
import { TokenBlacklistGuard } from './guards/token-blacklist.guard';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { AdminController } from './controllers/admin.controller';

/**
 * Module contenant les guards et services communs de sécurité
 * À importer dans les modules qui utilisent @TokenProtected ou @OwnerProtected
 */
@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET', 'secret'),
                signOptions: { expiresIn: '1d' }
            })
        })
    ],
    controllers: [AdminController],
    providers: [
        PrismaService,
        TokenBlacklistService,
        TokenCleanupService,
        TokenBlacklistGuard,
        ResourceOwnerGuard
    ],
    exports: [
        JwtModule,           // ✅ Correctement exporté
        TokenBlacklistGuard, // ✅ Disponible pour injection
        ResourceOwnerGuard,  // ✅ Disponible pour injection
        TokenBlacklistService,
        TokenCleanupService,
        PrismaService
    ]
})
export class SecurityModule {}
