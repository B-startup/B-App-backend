import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { PrismaService } from '../../../core/services/prisma.service';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [
        ConfigModule,
        SecurityModule,
        MulterModule.register({
            limits: {
                fileSize: 10 * 1024 * 1024 // 10MB
            }
        })
    ],
    controllers: [FileController],
    providers: [FileService, PrismaService],
    exports: [FileService]
})
export class FileModule {}
