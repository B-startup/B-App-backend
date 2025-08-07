import { ApiProperty } from '@nestjs/swagger';
import { PostMediaType } from '@prisma/client';

export class PostMediaResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the post media',
        example: 'uuid-string'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the post this media belongs to',
        example: 'uuid-string'
    })
    postId: string;

    @ApiProperty({
        description: 'URL or path to the media file',
        example: '/uploads/postMedia/images/1234567890-image.jpg'
    })
    mediaUrl: string;

    @ApiProperty({
        description: 'Type of the media file',
        enum: PostMediaType,
        example: PostMediaType.IMAGE
    })
    mediaType: PostMediaType;

    @ApiProperty({
        description: 'Timestamp when the media was created',
        example: '2025-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the media was last updated',
        example: '2025-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
}
