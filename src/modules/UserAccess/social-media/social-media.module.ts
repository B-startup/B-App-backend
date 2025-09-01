import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from '../../../core/common/security.module';
import { PrismaService } from '../../../core/services/prisma.service';
import { SocialMediaService } from './social-media.service';
import { SocialMediaController } from './social-media.controller';

@Module({
    imports: [ConfigModule, SecurityModule],
    controllers: [SocialMediaController],
    providers: [SocialMediaService, PrismaService],
    exports: [SocialMediaService]
})
export class SocialMediaModule {}
