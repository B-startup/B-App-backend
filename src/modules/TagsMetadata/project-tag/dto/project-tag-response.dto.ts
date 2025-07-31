import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ProjectTagResponseDto {
    @ApiProperty({
        example: 'project-tag-uuid-123',
        description: 'Unique identifier of the project-tag association'
    })
    @Expose()
    id: string;

    @ApiProperty({
        example: 'project-uuid-123',
        description: 'ID of the associated project'
    })
    @Expose()
    projectId: string;

    @ApiProperty({
        example: 'tag-uuid-456',
        description: 'ID of the associated tag'
    })
    @Expose()
    tagId: string;

    @ApiProperty({
        example: '2025-07-30T12:00:00.000Z',
        description: 'Date when the association was created'
    })
    @Expose()
    @Transform(({ value }) => value?.toISOString())
    createdAt: string;

    @ApiProperty({
        description: 'Project details (included when populated)',
        required: false
    })
    @Expose()
    project?: {
        id: string;
        title: string;
        description: string;
        status: string;
    };

    @ApiProperty({
        description: 'Tag details (included when populated)',
        required: false
    })
    @Expose()
    tag?: {
        id: string;
        name: string;
        description?: string;
    };
}
