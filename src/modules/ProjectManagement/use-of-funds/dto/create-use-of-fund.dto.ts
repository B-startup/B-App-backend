import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateUseOfFundsDto {
    @IsNotEmpty()
    @IsString()
    projectId: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(100)
    usePercentage: number;
}
