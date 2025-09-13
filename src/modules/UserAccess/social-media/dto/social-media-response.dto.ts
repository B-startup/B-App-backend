import { ApiProperty } from '@nestjs/swagger';
import { SocialMediaPlatform } from '@prisma/client';

export class SocialMediaResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the social media record',
        example: 'social-media-uuid-123'
    })
    id: string;



    @ApiProperty({
        description: 'Social media platform',
        enum: SocialMediaPlatform,
        example: SocialMediaPlatform.LINKEDIN
    })
    platform: SocialMediaPlatform;

    @ApiProperty({
        description: 'URL of the social media profile',
        example: 'https://linkedin.com/in/username'
    })
    url: string;

    @ApiProperty({
        description: 'Timestamp when the record was created',
        example: '2024-01-15T10:00:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the record was last updated',
        example: '2024-01-15T10:00:00Z'
    })
    updatedAt: Date;
}
