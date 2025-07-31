import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentUserDto {
    @ApiProperty({ description: 'User ID' })
    id: string;

    @ApiProperty({ description: 'User name' })
    name: string;

    @ApiPropertyOptional({ description: 'User profile picture URL' })
    profilePicture?: string;
}

export class CommentResponseDto {
    @ApiProperty({ description: 'Comment ID' })
    id: string;

    @ApiProperty({ description: 'User ID who wrote the comment' })
    userId: string;

    @ApiPropertyOptional({ description: 'Project ID associated with the comment' })
    projectId?: string;

    @ApiPropertyOptional({ description: 'Post ID associated with the comment' })
    postId?: string;

    @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
    parentId?: string;

    @ApiProperty({ description: 'Content of the comment' })
    content: string;

    @ApiProperty({ description: 'Number of likes the comment has received' })
    nbLikes: number;

    @ApiProperty({ description: 'Comment creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Comment last update timestamp' })
    updatedAt: Date;

    @ApiPropertyOptional({ description: 'User who wrote the comment', type: CommentUserDto })
    user?: CommentUserDto;

    @ApiPropertyOptional({ description: 'Replies to this comment', type: [CommentResponseDto] })
    replies?: CommentResponseDto[];
}

export class CommentStatsDto {
    @ApiProperty({ description: 'Total number of comments' })
    totalComments: number;

    @ApiProperty({ description: 'Number of top-level comments' })
    topLevelComments: number;

    @ApiProperty({ description: 'Number of replies' })
    replies: number;
}
