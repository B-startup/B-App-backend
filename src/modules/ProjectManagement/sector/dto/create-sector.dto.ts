import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSectorDto {
    @ApiProperty({
        example: 'Healthcare',
        description: 'Name of the sector (must be unique)'
    })
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value.trim())
    name: string;

    @ApiProperty({
        example: 'Sector related to medical technology and services',
        description: 'Optional description for the sector',
        required: false
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    description?: string;
}
