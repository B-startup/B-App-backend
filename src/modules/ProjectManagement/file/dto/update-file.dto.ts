import { PartialType } from '@nestjs/swagger';
import { CreateFileDto } from './create-file.dto';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '@prisma/client';

export class UpdateFileDto extends PartialType(CreateFileDto) {
    @ApiProperty({
        description: 'Name of the file',
        example: 'updated_business_plan.pdf',
        required: false
    })
    @IsString()
    @IsOptional()
    fileName?: string;

    @ApiProperty({
        description: 'Type of the file',
        enum: FileType,
        example: FileType.PDF,
        required: false
    })
    @IsEnum(FileType)
    @IsOptional()
    fileType?: FileType;

    @ApiProperty({
        description: 'URL or path where the file is stored',
        example: 'uploads/ProjectFiles/project-123/updated_business_plan.pdf',
        required: false
    })
    @IsString()
    @IsOptional()
    fileUrl?: string;
}
