import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTeamDto {
    @ApiProperty({ example: 'Engineering Team' })
    @IsString()
    @MaxLength(100)
    @Transform(({ value }) => value.trim())
    name: string;

    @ApiProperty({
        example: 'Responsible for backend and infrastructure',
        required: false
    })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    description?: string;
}
