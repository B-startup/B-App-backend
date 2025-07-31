import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterestDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty()
    @IsUUID()
    sectorId: string;
}
