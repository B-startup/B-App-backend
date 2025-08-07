import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsBoolean,
    IsOptional,
    IsNotEmpty,
    MaxLength
} from 'class-validator';

export class CreatePostDto {
    @ApiProperty({
        description: 'ID of the user creating the post',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        description: 'Title or headline of the post',
        example: 'My Amazing Post Title',
        maxLength: 200
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty({
        description: 'Main textual content of the post',
        example: 'This is my post content...',
        maxLength: 5000
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(5000)
    content: string;

    @ApiProperty({
        description: 'Visibility of the post',
        example: true,
        default: true,
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isPublic?: boolean = true;

    @ApiProperty({
        description: 'Optional ML prediction or label',
        example: 'category-prediction',
        required: false
    })
    @IsString()
    @IsOptional()
    mlPrediction?: string;
}
