import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { CloudinaryService } from '../../../core/services/cloudinary.service';
import { PrismaService } from '../../../core/services/prisma.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [
        ConfigModule,
        SecurityModule,
        MulterModule.register({
            limits: {
                fileSize: 50 * 1024 * 1024 // 50MB pour documents
            }
        })
    ],
    controllers: [FileController],
    providers: [FileService, CloudinaryService, PrismaService],
    exports: [FileService]
})
export class FileModule {}
