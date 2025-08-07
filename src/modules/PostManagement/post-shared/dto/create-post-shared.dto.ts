import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreatePostSharedDto {
    @ApiProperty({
        description: 'ID of the post to share',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    postId: string;

    @ApiProperty({
        description: 'ID of the user sharing the post',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Optional description or message when sharing',
        example: 'Check out this amazing post!',
        required: false,
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}
