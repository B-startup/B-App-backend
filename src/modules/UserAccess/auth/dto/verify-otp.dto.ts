import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsIn,
    IsOptional
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty({ example: 'user@example.com' })
    email: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: '1234' })
    otpCode: string;

    @IsOptional()
    @IsString()
    @IsIn(['verify', 'reset'])
    @ApiProperty({
        example: 'verify',
        enum: ['verify', 'reset'],
        default: 'verify',
        required: false,
        description:
            'Type of verification: verify for email verification, reset for password reset'
    })
    type?: 'verify' | 'reset' = 'verify';
}
