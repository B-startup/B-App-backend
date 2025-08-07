import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UploadVideoDto {
    @ApiProperty({
        description: 'Title of the video',
        example: 'Project Demo Video'
    })
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Description of the video',
        example: 'This video demonstrates the main features of our project',
        required: false
    })
    @IsOptional()
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
        type: 'string',
        format: 'binary',
        description: 'Video file to upload'
    })
    file: any;
}
