import { ApiProperty } from '@nestjs/swagger';
import { Follow } from '@prisma/client';

export class FollowResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the follow relationship',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the user who is following',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    followerId: string;

    @ApiProperty({
        description: 'ID of the user being followed',
        example: '123e4567-e89b-12d3-a456-426614174002'
    })
    followingId: string;

    @ApiProperty({
        description: 'Timestamp when the follow was created',
        example: '2024-01-01T00:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the follow was last updated',
        example: '2024-01-01T00:00:00.000Z'
    })
    updatedAt: Date;

    constructor(follow: Follow) {
        this.id = follow.id;
        this.followerId = follow.followerId;
        this.followingId = follow.followingId;
        this.createdAt = follow.createdAt;
        this.updatedAt = follow.updatedAt;
    }
}

export class FollowWithUserDetailsDto extends FollowResponseDto {
    @ApiProperty({
        description: 'Details of the follower user',
        type: 'object'
    })
    follower?: {
        id: string;
        name: string;
        email: string;
    };

    @ApiProperty({
        description: 'Details of the followed user',
        type: 'object'
    })
    following?: {
        id: string;
        name: string;
        email: string;
    };
}
