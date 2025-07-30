import { ApiProperty } from '@nestjs/swagger';

export class PostTagResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the post-tag association',
        example: 'uuid-string'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the associated post',
        example: 'uuid-string'
    })
    postId: string;

    @ApiProperty({
        description: 'ID of the associated tag',
        example: 'uuid-string'
    })
    tagId: string;

    @ApiProperty({
        description: 'Timestamp when the association was created',
        example: '2025-07-30T10:30:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the association was last updated',
        example: '2025-07-30T10:30:00.000Z'
    })
    updatedAt: Date;
}
