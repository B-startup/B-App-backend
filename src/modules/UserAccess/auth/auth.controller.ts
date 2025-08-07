import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import {
    CurrentUser,
    CurrentToken
} from '../../../core/common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-in')
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async signIn(@Body() credentials: LoginDto) {
        return this.authService.signIn(credentials);
    }

    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP code' })
    @ApiResponse({ status: 200, description: 'OTP verified successfully' })
    @ApiResponse({ status: 400, description: 'Invalid OTP' })
    async verifyOtp(@Body() otpDto: VerifyOtpDto) {
        return this.authService.verifyOtp(otpDto);
    }

    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend OTP code' })
    @ApiResponse({ status: 200, description: 'OTP sent successfully' })
    @ApiResponse({ status: 400, description: 'Invalid email' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
        return this.authService.resendOtp(
            resendOtpDto.email,
            resendOtpDto.type
        );
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiBody({ schema: { example: { refreshToken: 'string' } } })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(refreshToken);
    }

    @Post('forget-password')
    @ApiOperation({ summary: 'Request password reset' })
    @ApiResponse({ status: 200, description: 'Reset email sent' })
    async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
        return this.authService.forgetPassword(forgetPasswordDto.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid token' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(
            resetPasswordDto.email,
            resetPasswordDto.password
        );
    }

    @Post('logout')
    @TokenProtected()
    @ApiOperation({ summary: 'Logout user with token blacklist verification' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({
        status: 401,
        description: 'Token invalid or user not found'
    })
    async logout(
        @CurrentUser() user: any,
        @CurrentToken() token: string,
        @Body() logoutDto?: LogoutDto
    ) {
        return this.authService.logout(
            user.sub, // userId from JWT payload
            token, // token from request header
            logoutDto?.logoutFromAllDevices || false
        );
    }

    @Post('validate-token')
    @TokenProtected()
    @ApiOperation({ summary: 'Validate current token (requires valid token)' })
    @ApiResponse({ status: 200, description: 'Token is valid' })
    @ApiResponse({ status: 401, description: 'Token is invalid or revoked' })
    async validateToken(
        @CurrentUser() user: any,
        @CurrentToken() _token: string
    ) {
        // Si on arrive ici, le token est déjà validé par TokenBlacklistGuard
        return {
            valid: true,
            userId: user.sub,
            email: user.email,
            message: 'Token is valid and not blacklisted'
        };
    }
}
