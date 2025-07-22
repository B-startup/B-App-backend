import { Injectable, ConflictException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';
import { BaseService } from '../../core/services/base.service';
import { PrismaService } from '../../core/services/prisma.service';
import {
    cryptPassword,
    handleOtpOperation
} from '../../core/utils/auth';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { EmailSubject, EmailTemplate } from 'src/core/constants/email.constants';

@Injectable()
export class UserService extends BaseService<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(
        private readonly prisma: PrismaService,
        private readonly mailerService: MailerService
    ) {
        super(prisma.user, 'User');
    }

    async create(createDto: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createDto.email }
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const user = await this.prisma.user.create({
            data: {
                ...createDto,
                password: await cryptPassword(createDto.password),
                isEmailVerified: false
            }
        });

        // Generate and send OTP for verification
        await handleOtpOperation(
            this.prisma,
            this.mailerService,
            createDto.email,    
            {
                template: EmailTemplate.VERIFY_ACCOUNT,
                subject: EmailSubject.VERIFY_ACCOUNT
            }
        );
        return user;
    }
}
