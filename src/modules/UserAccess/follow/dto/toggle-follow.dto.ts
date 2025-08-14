import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleFollowDto {
    @ApiProperty({
        description: 'ID of the user who is following',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    followerId: string;

    @ApiProperty({
        description: 'ID of the user being followed',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    followingId: string;
}
