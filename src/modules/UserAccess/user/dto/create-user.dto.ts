import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsEmail,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    IsEnum
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

    @ApiPropertyOptional({ example: $Enums.UserRole.User, enum: $Enums.UserRole, description: 'User role in the system' })
    @IsOptional()
    @IsEnum($Enums.UserRole, { message: 'Role must be User or ADMIN' })
    role?: $Enums.UserRole;
}
