import { Module } from '@nestjs/common';
import { PostSectorService } from './post-sector.service';
import { PostSectorController } from './post-sector.controller';
import { PrismaService } from '../../../core/services/prisma.service';

@Module({
    controllers: [PostSectorController],
    providers: [PostSectorService, PrismaService],
    exports: [PostSectorService]
})
export class PostSectorModule {}
