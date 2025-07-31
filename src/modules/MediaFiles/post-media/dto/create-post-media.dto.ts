import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PostMediaType } from '@prisma/client';

export class CreatePostMediaDto {
    @ApiProperty({
        description: 'ID of the post this media belongs to',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    postId: string;

    @ApiProperty({
        description: 'URL or path to the media file',
        example: '/uploads/postMedia/images/1234567890-image.jpg'
    })
    @IsString()
    @IsNotEmpty()
    mediaUrl: string;

    @ApiProperty({
        description: 'Type of the media file',
        enum: PostMediaType,
        example: PostMediaType.IMAGE
    })
    @IsEnum(PostMediaType)
    @IsNotEmpty()
    mediaType: PostMediaType;
}
