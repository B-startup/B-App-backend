import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PostMediaType } from '@prisma/client';

export class UploadPostMediaDto {
    @ApiProperty({
        description: 'ID of the post this media belongs to',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    postId: string;

    @ApiProperty({
        description: 'Type of the media file',
        enum: PostMediaType,
        example: PostMediaType.IMAGE
    })
    @IsEnum(PostMediaType)
    @IsNotEmpty()
    mediaType: PostMediaType;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Media file to upload (image or video)'
    })
    file: Express.Multer.File;
}
