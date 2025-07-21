import { Injectable, ConflictException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { BaseService } from '../../core/services/base.service';
import { PrismaService } from '../../core/services/prisma.service';
import {
    cryptPassword,
    sendOtpToEmail,
    generateOTP
} from '../../core/utils/auth';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService extends BaseService<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly mailerService: MailerService
    ) {
        super(prismaService.user, 'User');
    }

    async create(createDto: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.prismaService.user.findUnique({
            where: { email: createDto.email }
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const user = await this.prismaService.user.create({
            data: {
                ...createDto,
                password: await cryptPassword(createDto.password),
                isEmailVerified: false
            }
        });

        // Generate and send OTP for verification
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        // Store OTP for verification
        await this.prismaService.user.update({
            where: { email: user.email },
            data: {
                otpCode: otp,
                otpCodeExpiresAt: expiresAt
            }
        });

        // Send verification email
        await sendOtpToEmail(this.mailerService, user.email, otp);

        return user;
    }
}
