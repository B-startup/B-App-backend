import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAttemptLogDto {
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    ipAddress?: string;

    @IsBoolean()
    sucssess: boolean;

    @IsOptional()
    @IsString()
    reason?: string;
}
