import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsBoolean, IsString } from 'class-validator';

export class LogoutDto {
    @ApiPropertyOptional({
        description: 'User ID (optionnel, peut être extrait du token)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID()
    userId?: string;

    @ApiPropertyOptional({
        description: 'Token à invalider (optionnel)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    @IsOptional()
    @IsString()
    token?: string;

    @ApiPropertyOptional({
        description: 'Déconnecter de tous les appareils',
        example: false,
        default: false
    })
    @IsOptional()
    @IsBoolean()
    logoutFromAllDevices?: boolean;
}
