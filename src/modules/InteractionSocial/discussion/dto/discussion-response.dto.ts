import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscussionType } from '@prisma/client';

export class DiscussionResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the discussion',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the user who initiated the discussion',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    senderId: string;

    @ApiProperty({
        description: 'ID of the user who received the discussion',
        example: '123e4567-e89b-12d3-a456-426614174002'
    })
    receiverId: string;

    @ApiProperty({
        description: 'Type of discussion',
        enum: DiscussionType,
        example: DiscussionType.PRIVATE
    })
    type: DiscussionType;

    @ApiPropertyOptional({
        description: 'ID of the project if the discussion is project-related',
        example: '123e4567-e89b-12d3-a456-426614174003'
    })
    projectId?: string;

    @ApiProperty({
        description: 'Timestamp when the discussion was created',
        example: '2023-12-01T10:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the discussion was last updated',
        example: '2023-12-01T15:30:00.000Z'
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
        description: 'Information about the receiver user',
        type: 'object'
    })
    receiver?: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };

    @ApiPropertyOptional({
        description: 'Information about the associated project',
        type: 'object'
    })
    project?: {
        id: string;
        title: string;
        description: string;
    };

    @ApiPropertyOptional({
        description: 'Last message in the discussion',
        type: 'object'
    })
    lastMessage?: {
        id: string;
        content: string;
        senderId: string;
        createdAt: Date;
    };

    @ApiPropertyOptional({
        description: 'Total number of messages in the discussion',
        example: 15
    })
    messageCount?: number;
}
