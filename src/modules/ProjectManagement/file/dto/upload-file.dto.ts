import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileType } from '@prisma/client';

export class UploadFileDto {
    @ApiProperty({
        description: 'ID of the project this file belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiPropertyOptional({
        description: 'Type of the file (auto-detected if not provided)',
        enum: FileType,
        example: FileType.PDF
    })
    @IsOptional()
    @IsEnum(FileType)
    fileType?: FileType;

    @ApiProperty({
        description: 'File to upload',
        type: 'string',
        format: 'binary'
    })
    file: Express.Multer.File;
}
