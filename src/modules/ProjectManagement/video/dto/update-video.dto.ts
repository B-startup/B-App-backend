import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateVideoDto } from './create-video.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateVideoDto extends PartialType(CreateVideoDto) {
    @ApiProperty({
        description: 'Video ID to update',
        example: 'video-uuid-123'
    })
    @IsOptional()
    @IsUUID()
    id?: string;
}
