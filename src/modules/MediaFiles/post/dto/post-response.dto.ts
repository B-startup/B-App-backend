import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the post',
        example: 'uuid-string'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the user who created the post',
        example: 'uuid-string'
    })
    userId: string;

    @ApiProperty({
        description: 'Title or headline of the post',
        example: 'My Amazing Post Title'
    })
    title: string;

    @ApiProperty({
        description: 'Main textual content of the post',
        example: 'This is my post content...'
    })
    content: string;

    @ApiProperty({
        description: 'Number of likes the post has received',
        example: 10
    })
    nbLikes: number;

    @ApiProperty({
        description: 'Number of comments on the post',
        example: 5
    })
    nbComments: number;

    @ApiProperty({
        description: 'Number of times the post has been shared',
        example: 2
    })
    nbShares: number;

    @ApiProperty({
        description: 'Number of times the post has been viewed',
        example: 100
    })
    nbViews: number;

    @ApiProperty({
        description: 'Visibility of the post',
        example: true
    })
    isPublic: boolean;

    @ApiProperty({
        description: 'Optional ML prediction or label',
        example: 'category-prediction',
        required: false
    })
    mlPrediction?: string;

    @ApiProperty({
        description: 'Timestamp when the post was created',
        example: '2025-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the post was last updated',
        example: '2025-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
}
