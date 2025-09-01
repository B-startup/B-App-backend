import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { TypeOfExperience } from '@prisma/client';

export class CreateExperienceEducationDto {
    @ApiProperty()
    @IsString()
    userId: string;

    @ApiProperty({ example: 'Software Engineer' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Google' })
    @IsString()
    organization: string;

    @ApiProperty({ example: 'Bachelor of Science', required: false })
    @IsOptional()
    @IsString()
    degree?: string;

    @ApiProperty({ example: 'Computer Science', required: false })
    @IsOptional()
    @IsString()
    fieldOfStudy?: string;

    @ApiProperty({ example: 'California, USA', required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ example: 'https://google.com', required: false })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({
        example: 'Developed cloud-based solutions.',
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '2020-01-01T00:00:00Z' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2022-01-01T00:00:00Z', required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({ enum: TypeOfExperience })
    @IsEnum(TypeOfExperience)
    typeOfExperience: TypeOfExperience;
}
