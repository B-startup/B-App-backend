import { Module } from '@nestjs/common';
import { TeamUsersService } from './team-users.service';
import { TeamUsersController } from './team-users.controller';

@Module({
    controllers: [TeamUsersController],
    providers: [TeamUsersService]
})
export class TeamUsersModule {}
