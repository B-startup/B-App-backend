import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
    @ApiProperty({
        description: 'Number of likes',
        example: 10,
        required: false
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    nbLikes?: number;

    @ApiProperty({
        description: 'Number of comments',
        example: 5,
        required: false
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    nbComments?: number;

    @ApiProperty({
        description: 'Number of shares',
        example: 2,
        required: false
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    nbShares?: number;

    @ApiProperty({
        description: 'Number of views',
        example: 100,
        required: false
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    nbViews?: number;
}
