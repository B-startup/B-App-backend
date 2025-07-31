import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLikeDto {
    @ApiProperty({ description: 'ID of the user who liked the item' })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiPropertyOptional({ description: 'ID of the project liked' })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({ description: 'ID of the post liked' })
    @IsUUID()
    @IsOptional()
    postId?: string;

    @ApiPropertyOptional({ description: 'ID of the comment liked' })
    @IsUUID()
    @IsOptional()
    commentId?: string;
}
