import { ApiProperty } from '@nestjs/swagger';
import {
    IsUUID,
    IsNumber,
    IsOptional,
    IsEnum,
    IsDateString
} from 'class-validator';
import { StatusOffer } from '../enums/status-offer.enum';

export class CreateOfferDto {
    @ApiProperty({ example: 'uuid-user', description: 'ID of the user' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: 'uuid-project', description: 'ID of the project' })
    @IsUUID()
    projectId: string;

    @ApiProperty({ example: 50000, description: 'Amount offered' })
    @IsNumber()
    amount: number;

    @ApiProperty({ example: 15, description: 'Equity requested (%)' })
    @IsNumber()
    equity: number;

    @ApiProperty({
        example: 'Strategic investment for market expansion',
        required: false
    })
    @IsOptional()
    offerDescription?: string;

    @ApiProperty({
        enum: StatusOffer,
        example: StatusOffer.PENDING,
        required: false
    })
    @IsOptional()
    @IsEnum(StatusOffer)
    status?: StatusOffer;

    @ApiProperty({
        example: '2025-08-01T12:00:00Z',
        required: false
    })
    @IsOptional()
    @IsDateString()
    responseAt?: string;
}
