import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostTagDto {
    @ApiProperty({
        description: 'ID of the post to associate with a tag',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    postId: string;

    @ApiProperty({
        description: 'ID of the tag to associate with the post',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    tagId: string;
}
