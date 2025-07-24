import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../core/services/prisma.service';
import {
    comparePassword,
    cryptPassword,
    generateOTP,
    sendOtpToEmail
} from '../../../core/utils/auth';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly UserService: UserService,
        private readonly mailerService: MailerService
    ) {}

    async signIn(credentials: LoginDto) {
        const { email, password } = credentials;

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid)
            throw new UnauthorizedException('Invalid credentials');

        if (!user.isEmailVerified)
            throw new UnauthorizedException('User Not Verified');

        const token = this.jwtService.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.profilePicture
            },
            {
                expiresIn: '1d'
            }
        );

        const refreshToken = this.jwtService.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.profilePicture
            },
            {
                expiresIn: '7d'
            }
        );

        return { token, refreshToken };
    }

    async refreshToken(refreshToken: string) {
        const { id } = this.jwtService.verify(refreshToken);
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new UnauthorizedException('User not found');

        const token = this.jwtService.sign({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.profilePicture
        });
        return { token, refreshToken };
    }

    async forgetPassword(email: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('User not found');

        const code = generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await this.prisma.user.update({
            where: { email },
            data: {
                otpCode: code,
                otpCodeExpiresAt: expiresAt
            }
        });

        await sendOtpToEmail(
            this.mailerService,
            user.email,
            code,
            'Reset password',
            'reset-password'
        );
    }

    async resetPassword(email: string, newPassword: string): Promise<void> {
        const hashedPassword = await cryptPassword(newPassword);
        await this.prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
    }

    async verifyOtp(otpDto: VerifyOtpDto) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: otpDto.email,
                otpCode: otpDto.otpCode,
                isEmailVerified: false // Only verify unverified users
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid OTP');
        }

        // Check if OTP has expired
        if (user.otpCodeExpiresAt && user.otpCodeExpiresAt < new Date()) {
            throw new UnauthorizedException(
                'OTP has expired. Please request a new one.'
            );
        }

        // Update user as verified and clear OTP
        await this.prisma.user.update({
            where: { email: otpDto.email },
            data: {
                otpCode: null,
                otpCodeExpiresAt: null,
                isEmailVerified: true
            }
        });

        // Return success message (no need to generate tokens here)
        return {
            message: 'Email verified successfully'
        };
    }

    async resendOtp(email: string) {
        if (!email) {
            throw new UnauthorizedException('Email is required');
        }

        // Check if user exists and not verified
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const otp = generateOTP();

        // Send the OTP email first
        await sendOtpToEmail(this.mailerService, user.email, otp);

        // Then update the user record
        return this.prisma.user.update({
            where: { email },
            data: {
                otpCode: otp,
                otpCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
                isEmailVerified: false
            }
        });
    }
}
