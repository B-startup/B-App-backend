import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the message',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the discussion this message belongs to',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    discussionId: string;

    @ApiProperty({
        description: 'ID of the user who sent the message',
        example: '123e4567-e89b-12d3-a456-426614174002'
    })
    senderId: string;

    @ApiProperty({
        description: 'Content of the message',
        example: 'Hello! I am interested in your project.'
    })
    content: string;

    @ApiProperty({
        description: 'Timestamp when the message was created',
        example: '2023-12-01T10:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the message was last updated',
        example: '2023-12-01T10:05:00.000Z'
    })
    updatedAt: Date;

    @ApiPropertyOptional({
        description: 'Information about the sender user',
        type: 'object'
    })
    sender?: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };

    @ApiPropertyOptional({
        description: 'Information about the discussion',
        type: 'object'
    })
    discussion?: {
        id: string;
        type: string;
        senderId: string;
        receiverId: string;
        projectId?: string;
    };
}
