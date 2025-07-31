import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ConnectStatus } from '../enums/connect-status.enum';

export class CreateConnectDto {
    @ApiProperty({ example: 'user-uuid' })
    @IsString()
    @Transform(({ value }) => value.trim())
    userId: string;

    @ApiProperty({ example: 'project-uuid' })
    @IsString()
    @Transform(({ value }) => value.trim())
    projectId: string;

    @ApiProperty({ enum: ConnectStatus, default: ConnectStatus.PENDING })
    @IsOptional()
    @IsEnum(ConnectStatus)
    connectSatus?: ConnectStatus;
}
