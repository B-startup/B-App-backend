import { Module } from '@nestjs/common';
import { VisitorProfileProjectService } from './visitor-profile-project.service';
import { VisitorProfileProjectController } from './visitor-profile-project.controller';

@Module({
    controllers: [VisitorProfileProjectController],
    providers: [VisitorProfileProjectService]
})
export class VisitorProfileProjectModule {}
