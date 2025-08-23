import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsDateString,
    MaxLength,
    MinLength,
    IsUrl
} from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ example: 'A passionate developer interested in tech innovations', description: 'User bio or description' })
    @IsOptional()
    @IsString()
    @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
    @MinLength(10, {message: 'Description cannot be less than 10 characters'})
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

    @ApiPropertyOptional({ example: 'profile-images/image.jpg', description: 'Profile picture path' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    profilePicture?: string;

}
