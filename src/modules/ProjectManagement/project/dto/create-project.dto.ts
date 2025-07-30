import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsString,
    IsOptional,
    IsInt,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsDateString,
    Min,
    Max
} from 'class-validator';
import { Status, ProjectStage } from '@prisma/client';

export class CreateProjectDto {
    @ApiProperty({
        example: '26262626',
        description: 'ID of the project creator'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    creatorId: string;

    @ApiProperty({ example: 'EcoStartup', description: 'Title of the project' })
    @IsString()
    @Transform(({ value }) => value.trim())
    title: string;

    @ApiProperty({
        example: 'logo.png',
        description: 'Logo image file path or URL'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    logoImage: string;

    @ApiProperty({
        example: 'An app to reduce food waste',
        description: 'High-level summary'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    description: string;

    @ApiProperty({
        example: 'Food waste in households and restaurants',
        description: 'Problem targeted by the project'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    problem: string;

    @ApiProperty({
        example: 'A mobile app to connect restaurants with charities',
        description: 'Proposed solution'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    solution: string;

    @ApiProperty({
        example: 'Tunis, Tunisia',
        description: 'Location of the project'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    projectLocation: string;

    @ApiProperty({ example: 5, description: 'Team size' })
    @IsInt()
    teamSize: number;

    @ApiProperty({ example: 'team-uuid-456', required: false })
    @IsOptional()
    @IsString()
    @Transform(({ value }) => value?.trim())
    teamId?: string;

    @ApiProperty({ example: 150, description: 'Number of customers' })
    @IsInt()
    customersNumber: number;

    @ApiProperty({ example: 50000, description: 'Target funding amount' })
    @IsNumber()
    financialGoal: number;

    @ApiProperty({ example: 3000, description: 'Monthly revenue' })
    @IsNumber()
    monthlyRevenue: number;

    @ApiProperty({
        example: 5,
        description: 'Minimum equity percentage offered'
    })
    @IsInt()
    minPercentage: number;

    @ApiProperty({
        example: 15,
        description: 'Maximum equity percentage offered'
    })
    @IsInt()
    maxPercentage: number;

    @ApiProperty({ example: 1000, description: 'Price per 1% equity' })
    @IsNumber()
    percentageUnitPrice: number;

    @ApiProperty({
        example: 'sector-uuid-789',
        description: 'ID of the sector'
    })
    @IsString()
    @Transform(({ value }) => value.trim())
    sectorId: string;

    @ApiProperty({ enum: Status, default: Status.DRAFT })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @ApiProperty({ example: '2025-12-31', description: 'Runway date' })
    @IsDateString()
    runway: string;

    @ApiProperty({
        example: 'marketing-plan.pdf',
        description: 'Marketing plan document'
    })
    @IsString()
    marketPlan: string;

    @ApiProperty({
        example: 'business-plan.pdf',
        description: 'Business plan document'
    })
    @IsString()
    businessPlan: string;

    @ApiProperty({
        example: 0.75,
        required: false,
        description: 'Success probability (0-1)'
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    successProbability?: number;

    @ApiProperty({ enum: ProjectStage, example: ProjectStage.SEED })
    @IsEnum(ProjectStage)
    projectStage: ProjectStage;

    @ApiProperty({ example: 25, description: 'Net profit percentage' })
    @IsNumber()
    netProfit: number;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsInt()
    nbLikes?: number;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsInt()
    nbComments?: number;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsInt()
    nbViews?: number;

    @ApiProperty({ example: 0, required: false })
    @IsOptional()
    @IsInt()
    nbConnects?: number;

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    @IsBoolean()
    verifiedProject?: boolean;
}
