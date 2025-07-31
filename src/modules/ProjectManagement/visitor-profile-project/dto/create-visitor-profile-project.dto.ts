import { IsOptional, IsString } from 'class-validator';

export class CreateVisitorProfileProjectDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsString()
    userVisitorId: string;

    @IsOptional()
    @IsString()
    projectId?: string;
}
