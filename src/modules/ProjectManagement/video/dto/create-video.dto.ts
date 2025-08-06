import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateVideoDto {
    @ApiProperty({
        description: 'Title of the video',
        example: 'Project Demo Video'
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Description of the video',
        example: 'This video demonstrates the main features of our project',
        required: false
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value === '' ? undefined : value)
    description?: string;

    @ApiProperty({
        description: 'Project ID this video belongs to',
        example: 'project-uuid-123'
    })
    @IsUUID()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({
        description: 'Video duration in seconds',
        example: 120,
        required: false
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    duration?: number;

    @ApiProperty({
        description: 'Video thumbnail URL',
        example: 'https://example.com/thumbnail.jpg',
        required: false
    })
    @IsOptional()
    @IsString()
    thumbnailUrl?: string;
}
