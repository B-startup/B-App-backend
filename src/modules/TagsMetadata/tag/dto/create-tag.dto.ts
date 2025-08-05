import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTagDto {
    @ApiProperty({
        description: 'Name of the tag (must be unique)',
        example: 'Fintech',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : value
    )
    name: string;

    @ApiProperty({
        description:
            'Optional description explaining the context or usage of the tag',
        example: 'Financial technology related posts and projects',
        required: false,
        maxLength: 500
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    @Transform(({ value }) =>
        value && typeof value === 'string' ? value.trim() : value
    )
    description?: string;
}
