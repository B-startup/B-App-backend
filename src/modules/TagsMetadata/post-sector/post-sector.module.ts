import { Module } from '@nestjs/common';
import { PostSectorService } from './post-sector.service';
import { PostSectorController } from './post-sector.controller';
import { PrismaClient } from '@prisma/client';
import { SecurityModule } from '../../../core/common/security.module';

@Module({
    imports: [SecurityModule],
    controllers: [PostSectorController],
    providers: [PostSectorService, PrismaClient],
    exports: [PostSectorService]
})
export class PostSectorModule {}
