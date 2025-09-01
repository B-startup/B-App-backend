import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class MarkReadDto {
    @ApiProperty({
        description: 'Mark as read (true) or unread (false)',
        example: true,
        default: true
    })
    @IsOptional()
    @IsBoolean()
    isRead?: boolean = true;
}

export class MarkAllReadResponseDto {
    @ApiProperty({
        description: 'Number of notifications that were updated',
        example: 5
    })
    updated: number;
}
