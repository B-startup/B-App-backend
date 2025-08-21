import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {  IsUUID, IsEnum, IsOptional } from 'class-validator';
import { DiscussionType } from '@prisma/client';

export class CreateDiscussionDto {
    @ApiProperty({
        description: 'ID of the user who will receive the discussion',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    receiverId: string;

    @ApiProperty({
        description: 'Type of discussion',
        enum: DiscussionType,
        example: DiscussionType.PRIVATE
    })
    @IsEnum(DiscussionType)
    type: DiscussionType;

    @ApiPropertyOptional({
        description: 'ID of the project if the discussion is project-related',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    @IsOptional()
    @IsUUID()
    projectId?: string;
}
