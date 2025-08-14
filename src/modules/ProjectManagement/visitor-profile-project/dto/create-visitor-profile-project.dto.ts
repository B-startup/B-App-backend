import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVisitorProfileProjectDto {
    @ApiPropertyOptional({
        description: 'ID de l\'utilisateur dont le profil est visité',
        example: '9cceb4dd-ef81-45fe-ba02-d3060a1f3093',
        type: 'string',
        format: 'uuid'
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiProperty({
        description: 'ID de l\'utilisateur qui visite le profil/projet',
        example: '63686bb6-5b78-45f1-9d5c-2eef9b0f925e',
        type: 'string',
        format: 'uuid'
    })
    @IsString()
    userVisitorId: string;

    @ApiPropertyOptional({
        description: 'ID du projet visité (optionnel si c\'est une visite de profil)',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        type: 'string',
        format: 'uuid'
    })
    @IsOptional()
    @IsString()
    projectId?: string;
}
