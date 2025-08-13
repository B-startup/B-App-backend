import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsOptional,
    IsString,
    IsBoolean,
    IsDateString,
    IsInt,
    Min,
    Max,
    Matches,
    MaxLength,
    MinLength,
    IsEnum,
    IsUrl
} from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateUserDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email address for login' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @Transform(({ value }) => value.toLowerCase().trim())
    email: string;

    @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
    @Transform(({ value }) => value.trim())
    name: string;

    @ApiProperty({
        example: 'StrongPass123!',
        description: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(32, { message: 'Password cannot exceed 32 characters' })
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])/, {
        message: 'Password is too weak'
    })
    password: string;

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

    @ApiPropertyOptional({ example: $Enums.UserRole.User, enum: $Enums.UserRole, description: 'User role in the system' })
    @IsOptional()
    @IsEnum($Enums.UserRole, { message: 'Role must be User or ADMIN' })
    role?: $Enums.UserRole;

    @ApiPropertyOptional({ example: 'profile-images/image.jpg', description: 'Profile picture path' })
    @IsOptional()
    @Transform(({ value }) => value?.trim())
    profilePicture?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
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

export class UserResponseDto {
    @ApiProperty({ example: 'uuid-string', description: 'User unique identifier' })
    id: string;

    @ApiProperty({ example: 'user@example.com', description: 'User email address' })
    email: string;

    @ApiProperty({ example: 'John Doe', description: 'User full name' })
    name: string;

    @ApiPropertyOptional({ example: 'A passionate developer', description: 'User description' })
    description?: string;

    @ApiPropertyOptional({ example: 'Tunisia', description: 'User country' })
    country?: string;

    @ApiPropertyOptional({ example: 'Tunis', description: 'User city' })
    city?: string;

    @ApiPropertyOptional({ example: '1990-01-15T00:00:00.000Z', description: 'User birthdate' })
    birthdate?: Date;

    @ApiPropertyOptional({ example: '+216 20 123 456', description: 'User phone number' })
    phone?: string;

    @ApiPropertyOptional({ example: 'profile-images/image.jpg', description: 'Profile picture path' })
    profilePicture?: string;

    @ApiPropertyOptional({ example: 'https://example.com', description: 'User website' })
    webSite?: string;

    @ApiPropertyOptional({ example: '12345678', description: 'User CIN' })
    CIN?: string;

    @ApiPropertyOptional({ example: 'AB1234567', description: 'User passport' })
    passport?: string;

    @ApiProperty({ example: 100, description: 'User score' })
    score: number;

    @ApiProperty({ example: $Enums.UserRole.User, enum: $Enums.UserRole, description: 'User role' })
    role: $Enums.UserRole;

    @ApiProperty({ example: false, description: 'Email verification status' })
    isEmailVerified: boolean;

    @ApiProperty({ example: false, description: 'Profile completion status' })
    isCompleteProfile: boolean;

    @ApiProperty({ example: false, description: 'Phone verification status' })
    isPhoneVerified: boolean;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
    updatedAt: Date;
}

export class CreateUserWithImageDto {
    @ApiProperty({ type: CreateUserDto, description: 'User data' })
    userData: CreateUserDto;

    @ApiPropertyOptional({ 
        type: 'string', 
        format: 'binary', 
        description: 'Profile image file (JPEG, PNG, GIF, WebP max 2MB)' 
    })
    profileImage?: Express.Multer.File;
}

export class UpdateUserWithImageDto {
    @ApiProperty({ type: UpdateUserDto, description: 'User data to update' })
    userData: UpdateUserDto;

    @ApiPropertyOptional({ 
        type: 'string', 
        format: 'binary', 
        description: 'New profile image file (JPEG, PNG, GIF, WebP max 2MB)' 
    })
    profileImage?: Express.Multer.File;
}
