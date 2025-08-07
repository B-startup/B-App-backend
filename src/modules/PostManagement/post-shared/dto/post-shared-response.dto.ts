import { ApiProperty } from '@nestjs/swagger';

export class PostSharedResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the share record',
        example: 'uuid-string'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the shared post',
        example: 'uuid-string'
    })
    postId: string;

    @ApiProperty({
        description: 'ID of the user who shared the post',
        example: 'uuid-string'
    })
    userId: string;

    @ApiProperty({
        description: 'Optional description or message when sharing',
        example: 'Check out this amazing post!',
        required: false
    })
    description?: string;

    @ApiProperty({
        description: 'Timestamp when the share was created',
        example: '2025-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the share was last updated',
        example: '2025-01-01T00:00:00.000Z'
    })
    updatedAt: Date;
}
