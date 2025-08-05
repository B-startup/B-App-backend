import { IsString, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
    @ApiProperty({ description: 'ID of the user who wrote the comment' })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiPropertyOptional({
        description: 'ID of the project associated with the comment'
    })
    @IsUUID()
    @IsOptional()
    projectId?: string;

    @ApiPropertyOptional({
        description: 'ID of the post associated with the comment'
    })
    @IsUUID()
    @IsOptional()
    postId?: string;

    @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
    @IsUUID()
    @IsOptional()
    parentId?: string;

    @ApiProperty({ description: 'Content of the comment' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
