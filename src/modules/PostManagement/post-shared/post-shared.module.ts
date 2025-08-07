import { Module } from '@nestjs/common';
import { PostSharedService } from './post-shared.service';
import { PostSharedController } from './post-shared.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [PostSharedController],
    providers: [PostSharedService, PrismaClient],
    exports: [PostSharedService]
})
export class PostSharedModule {}
