import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [VideoController],
    providers: [VideoService, PrismaService, CloudinaryService],
    exports: [VideoService]
})
export class VideoModule {}
