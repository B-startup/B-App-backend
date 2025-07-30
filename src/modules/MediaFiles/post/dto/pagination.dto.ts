import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @ApiProperty({
        description: 'Page number',
        example: 1,
        default: 1,
        minimum: 1,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page (optimized for mobile)',
        example: 20,
        default: 20,
        minimum: 5,
        maximum: 50,
        required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(5)
    @Max(50)
    limit?: number = 20;
}

export class PaginatedPostResponseDto {
    @ApiProperty({
        description: 'Array of posts',
        type: 'array',
        items: {
            $ref: '#/components/schemas/PostResponseDto'
        }
    })
    data: any[];

    @ApiProperty({
        description: 'Pagination metadata'
    })
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}
