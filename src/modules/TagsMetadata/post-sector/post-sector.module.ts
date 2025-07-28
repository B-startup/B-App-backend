import { Module } from '@nestjs/common';
import { PostSectorService } from './post-sector.service';
import { PostSectorController } from './post-sector.controller';

@Module({
    controllers: [PostSectorController],
    providers: [PostSectorService]
})
export class PostSectorModule {}
