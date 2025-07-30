import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProjectTagDto {
    @ApiProperty({
        example: 'project-uuid-123',
        description: 'ID of the project'
    })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    projectId: string;

    @ApiProperty({
        example: 'tag-uuid-456',
        description: 'ID of the tag'
    })
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    tagId: string;
}
