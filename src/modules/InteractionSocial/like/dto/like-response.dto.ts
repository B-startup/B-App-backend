import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LikeUserDto {
    @ApiProperty({ description: 'User ID' })
    id: string;

    @ApiProperty({ description: 'User name' })
    name: string;

    @ApiPropertyOptional({ description: 'User profile picture URL' })
    profilePicture?: string;
}

export class LikeResponseDto {
    @ApiProperty({ description: 'Like ID' })
    id: string;

    @ApiProperty({ description: 'User ID who liked the item' })
    userId: string;

    @ApiPropertyOptional({ description: 'Project ID liked' })
    projectId?: string;

    @ApiPropertyOptional({ description: 'Post ID liked' })
    postId?: string;

    @ApiPropertyOptional({ description: 'Comment ID liked' })
    commentId?: string;

    @ApiProperty({ description: 'Like creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Like last update timestamp' })
    updatedAt: Date;

    @ApiPropertyOptional({
        description: 'User who created the like',
        type: LikeUserDto
    })
    user?: LikeUserDto;
}

export class LikeToggleResponseDto {
    @ApiProperty({ description: 'Whether the item is now liked' })
    liked: boolean;

    @ApiPropertyOptional({
        description: 'Like object if liked',
        type: LikeResponseDto
    })
    like?: LikeResponseDto;
}

export class UserLikeActivityDto {
    @ApiProperty({ description: 'Total number of likes by user' })
    totalLikes: number;

    @ApiProperty({ description: 'Number of project likes by user' })
    projectLikes: number;

    @ApiProperty({ description: 'Number of post likes by user' })
    postLikes: number;

    @ApiProperty({ description: 'Number of comment likes by user' })
    commentLikes: number;
}
