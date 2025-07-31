import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
    EmailTemplate,
    EmailSubject
} from '../../../core/constants/email.constants';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../core/services/prisma.service';
import { TokenBlacklistService } from '../../../core/services/token-blacklist.service';
import {
    comparePassword,
    cryptPassword,
    handleOtpOperation
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
        private readonly mailerService: MailerService,
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    async signIn(credentials: LoginDto) {
        const { email, password } = credentials;

        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid)
            throw new UnauthorizedException('Invalid credentials');

        if (!user.isEmailVerified)
            throw new UnauthorizedException(
                'User Not Verified check your email for verification'
            );

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

        await handleOtpOperation(this.prisma, this.mailerService, email, {
            template: EmailTemplate.RESET_PASSWORD,
            subject: EmailSubject.RESET_PASSWORD
        });
    }

    async resetPassword(email: string, newPassword: string): Promise<void> {
        const hashedPassword = await cryptPassword(newPassword);
        await this.prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
    }

    async verifyOtp(otpDto: VerifyOtpDto) {
        const { email, otpCode, type = 'verify' } = otpDto;

        // First find user by email and OTP without additional conditions
        const user = await this.prisma.user.findFirst({
            where: {
                email,
                otpCode
            }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid OTP');
        }

        // Check if OTP has expired
        if (
            user.otpCodeExpiresAt &&
            user.otpCodeExpiresAt < new Date(Date.now())
        ) {
            throw new UnauthorizedException(
                'OTP has expired. Please request a new one.'
            );
        }

        // Handle email verification case
        if (type === 'verify') {
            if (user.isEmailVerified) {
                throw new UnauthorizedException('Email is already verified');
            }

            await this.prisma.user.update({
                where: { email },
                data: {
                    otpCode: null,
                    otpCodeExpiresAt: null,
                    isEmailVerified: true
                }
            });

            return {
                message: 'Email verified successfully'
            };
        }

        // Handle password reset case (type === 'reset')
        // Only clear the OTP, don't change verification status
        await this.prisma.user.update({
            where: { email },
            data: {
                otpCode: null,
                otpCodeExpiresAt: null
            }
        });

        return {
            message: 'OTP verified successfully, proceed with password reset'
        };
    }

    async resendOtp(email: string, type: 'verify' | 'reset' = 'verify') {
        if (!email) {
            throw new UnauthorizedException('Email is required');
        }

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // For verification type, check if already verified
        if (type === 'verify' && user.isEmailVerified) {
            throw new UnauthorizedException('Email already verified');
        }

        // Choose template and subject based on type
        const emailOptions =
            type === 'verify'
                ? {
                      template: EmailTemplate.VERIFY_ACCOUNT,
                      subject: EmailSubject.VERIFY_ACCOUNT
                  }
                : {
                      template: EmailTemplate.RESET_PASSWORD,
                      subject: EmailSubject.RESET_PASSWORD
                  };

        await handleOtpOperation(
            this.prisma,
            this.mailerService,
            email,
            emailOptions
        );
    }

    /**
     * Logout user avec blacklist et gestion des tokens
     * Cette implémentation révoque réellement les tokens côté serveur
     */
    async logout(
        userId?: string, 
        token?: string,
        logoutFromAllDevices: boolean = false
    ): Promise<{ 
        message: string; 
        instructions: string[] 
    }> {
        // Vérifier que l'utilisateur existe si userId fourni
        if (userId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Mettre à jour lastLogoutAt pour invalider les anciens tokens
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    lastLogoutAt: new Date()
                }
            });

            // Si logout de tous les appareils
            if (logoutFromAllDevices) {
                await this.tokenBlacklistService.blacklistAllUserTokens(userId, 'logout_all_devices');
            }
        }

        // Ajouter le token actuel à la blacklist s'il est fourni
        if (token) {
            await this.tokenBlacklistService.blacklistToken(token, userId, 'logout');
        }

        return {
            message: 'Logout successful. Token has been invalidated.',
            instructions: [
                'Token has been blacklisted on server',
                'Remove access token from localStorage/sessionStorage',
                'Clear refresh token',
                'Redirect to login page'
            ]
        };
    }

    /**
     * Vérifier si un token est valide (pas blacklisté)
     */
    async isTokenValid(token: string, userId?: string): Promise<boolean> {
        // Vérifier si le token est blacklisté
        const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return false;
        }

        // Si userId fourni, vérifier lastLogoutAt
        if (userId) {
            try {
                const decoded = this.jwtService.decode(token);
                const tokenIssuedAt = decoded && typeof decoded === 'object' && 'iat' in decoded 
                    ? new Date(decoded.iat * 1000) 
                    : null;

                if (tokenIssuedAt) {
                    const user = await this.prisma.user.findUnique({
                        where: { id: userId },
                        select: { lastLogoutAt: true }
                    });

                    // Si lastLogoutAt est après l'émission du token, le token est invalide
                    if (user?.lastLogoutAt && user.lastLogoutAt > tokenIssuedAt) {
                        return false;
                    }
                }
            } catch (error) {
                // Token malformé ou erreur de décodage
                console.error('Error decoding token:', error);
                return false;
            }
        }

        return true;
    }
}
