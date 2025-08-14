import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

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

    @ApiPropertyOptional({ example: 0, description: 'Number of posts created by the user' })
    nbPosts?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of projects created by the user' })
    nbProjects?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of offers made by the user' })
    nbOffer?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of connections/follows' })
    nbConnects?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of followers' })
    nbFollowers?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of users followed' })
    nbFollowing?: number;

    @ApiPropertyOptional({ example: 0, description: 'Number of profile visits' })
    nbVisits?: number;

    @ApiPropertyOptional({ example: 0, description: 'Time spent in the application (minutes)' })
    timeSpent?: number;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Account creation date' })
    createdAt: Date;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
    updatedAt: Date;
}
