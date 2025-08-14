import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsBoolean,
    IsDateString,
    IsInt,
    Min,
    Max,
    MaxLength,
    IsUrl
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ example: 'A passionate developer interested in tech innovations', description: 'User bio or description' })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    @Transform(({ value }) => value?.trim())
    description?: string;

    @ApiPropertyOptional({ example: 'Tunisia', description: 'Country of residence' })
    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'Country name cannot exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    country?: string;

    @ApiPropertyOptional({ example: 'Tunis', description: 'City of residence' })
    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'City name cannot exceed 100 characters' })
    @Transform(({ value }) => value?.trim())
    city?: string;

    @ApiPropertyOptional({ example: '1990-01-15', description: 'Birth date in YYYY-MM-DD format' })
    @IsOptional()
    @IsDateString({}, { message: 'Please provide a valid date in YYYY-MM-DD format' })
    birthdate?: string;

    @ApiPropertyOptional({ example: '+216 20 123 456', description: 'Phone number with country code' })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    phone?: string;

    @ApiPropertyOptional({ example: 'https://example.com', description: 'Personal or professional website URL' })
    @IsOptional()
    @IsUrl({}, { message: 'Please provide a valid URL' })
    webSite?: string;

    @ApiPropertyOptional({ example: '12345678', description: 'National ID number' })
    @IsOptional()
    @IsString()
    @MaxLength(20, { message: 'CIN cannot exceed 20 characters' })
    @Transform(({ value }) => value?.trim())
    CIN?: string;

    @ApiPropertyOptional({ example: 'AB1234567', description: 'Passport number' })
    @IsOptional()
    @IsString()
    @MaxLength(20, { message: 'Passport number cannot exceed 20 characters' })
    @Transform(({ value }) => value?.trim())
    passport?: string;

    @ApiPropertyOptional({ example: false, description: 'Email verification status' })
    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;

    @ApiPropertyOptional({ example: false, description: 'Profile completion status' })
    @IsOptional()
    @IsBoolean()
    isCompleteProfile?: boolean;

    @ApiPropertyOptional({ example: false, description: 'Phone verification status' })
    @IsOptional()
    @IsBoolean()
    isPhoneVerified?: boolean;

    @ApiPropertyOptional({ example: 100, description: 'User score based on activity' })
    @IsOptional()
    @IsInt()
    @Min(0, { message: 'Score cannot be negative' })
    @Max(10000, { message: 'Score cannot exceed 10000' })
    score?: number;
}
