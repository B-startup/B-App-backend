import { ApiProperty } from '@nestjs/swagger';

export class ViewResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the view record',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    id: string;

    @ApiProperty({
        description: 'ID of the user who viewed the video',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    userId: string;

    @ApiProperty({
        description: 'ID of the video that was viewed',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    videoId: string;

    @ApiProperty({
        description: 'Time spent watching the video in seconds',
        example: 120
    })
    timespent: number;

    @ApiProperty({
        description: 'Timestamp when the view was recorded',
        example: '2025-07-31T10:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the view record was last updated',
        example: '2025-07-31T10:30:00.000Z'
    })
    updatedAt: Date;
}
