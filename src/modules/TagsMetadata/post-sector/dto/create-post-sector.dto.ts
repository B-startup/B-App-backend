import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreatePostSectorDto {
    @ApiProperty({
        description: 'ID of the post to associate with a sector',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    postId: string;

    @ApiProperty({
        description: 'ID of the sector to associate with the post',
        example: 'uuid-string'
    })
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    sectorId: string;
}
