import { ApiProperty } from '@nestjs/swagger';

export class TagResponseDto {
    @ApiProperty({
        description: 'Unique identifier for the tag',
        example: 'uuid-string'
    })
    id: string;

    @ApiProperty({
        description: 'Name of the tag',
        example: 'Fintech'
    })
    name: string;

    @ApiProperty({
        description: 'Optional description of the tag',
        example: 'Financial technology related posts and projects',
        required: false
    })
    description?: string;

    @ApiProperty({
        description: 'Timestamp when the tag was created',
        example: '2025-07-30T10:30:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Timestamp when the tag was last updated',
        example: '2025-07-30T10:30:00.000Z'
    })
    updatedAt: Date;
}
