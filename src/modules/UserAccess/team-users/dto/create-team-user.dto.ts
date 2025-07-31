import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeamUserDto {
    @ApiProperty({ example: 'team-uuid-123' })
    @IsString()
    @Transform(({ value }) => value.trim())
    teamId: string;

    @ApiProperty({ example: 'user-uuid-456' })
    @IsString()
    @Transform(({ value }) => value.trim())
    userId: string;
}
