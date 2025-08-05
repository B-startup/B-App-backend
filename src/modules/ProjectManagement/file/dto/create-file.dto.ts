import { IsString, IsEnum, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@prisma/client';

export class CreateFileDto {
    @ApiProperty({
        description: 'ID of the project this file belongs to',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsString()
    @IsNotEmpty()
    projectId: string;

    @ApiProperty({
        description: 'Name of the file',
        example: 'business_plan.pdf'
    })
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @ApiProperty({
        description: 'Type of the file',
        enum: FileType,
        example: FileType.PDF
    })
    @IsEnum(FileType)
    fileType: FileType;

    @ApiProperty({
        description: 'URL or path where the file is stored',
        example: 'uploads/ProjectFiles/project-123/business_plan.pdf',
        required: false
    })
    @IsString()
    @IsOptional()
    fileUrl?: string;
}
