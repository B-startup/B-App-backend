import { ApiProperty } from '@nestjs/swagger';

export class VideoResponseDto {
    @ApiProperty({
        description: 'Video ID',
        example: 'video-uuid-123'
    })
    id: string;

    @ApiProperty({
        description: 'Title of the video',
        example: 'Project Demo Video'
    })
    title: string;

    @ApiProperty({
        description: 'Description of the video',
        example: 'This video demonstrates the main features of our project',
        nullable: true
    })
    description?: string;

    @ApiProperty({
        description: 'Project ID this video belongs to',
        example: 'project-uuid-123'
    })
    projectId: string;

    @ApiProperty({
        description: 'Video file URL',
        example: 'https://example.com/videos/project-demo.mp4'
    })
    videoUrl: string;

    @ApiProperty({
        description: 'Video file path on server',
        example: 'uploads/ProjectVideos/project-demo.mp4'
    })
    filePath: string;

    @ApiProperty({
        description: 'Video file size in bytes',
        example: 15728640
    })
    fileSize: number;

    @ApiProperty({
        description: 'Video MIME type',
        example: 'video/mp4'
    })
    mimeType: string;

    @ApiProperty({
        description: 'Video duration in seconds',
        example: 120,
        nullable: true
    })
    duration?: number;

    @ApiProperty({
        description: 'Video thumbnail URL',
        example: 'https://example.com/thumbnails/project-demo.jpg',
        nullable: true
    })
    thumbnailUrl?: string;

    @ApiProperty({
        description: 'Creation date',
        example: '2025-08-06T14:20:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update date',
        example: '2025-08-06T14:20:00.000Z'
    })
    updatedAt: Date;
}
