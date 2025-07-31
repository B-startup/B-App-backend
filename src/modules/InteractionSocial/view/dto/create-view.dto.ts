import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateViewDto {
    @ApiProperty({
        description: 'ID of the user who viewed the video',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'ID of the video that was viewed',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsString()
    @IsNotEmpty()
    videoId: string;

    @ApiPropertyOptional({
        description: 'Time spent watching the video in seconds',
        example: 120,
        minimum: 0
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    timespent?: number;
}
