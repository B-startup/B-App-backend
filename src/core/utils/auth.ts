import * as bcrypt from 'bcryptjs';
import { MailerService } from '@nestjs-modules/mailer';

export const comparePassword = async (
    password: string,
    hashedPassword: string
) => {
    return bcrypt.compare(password, hashedPassword);
};

export const cryptPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
};
/**
 * Generates a random OTP code of specified length
 * @param length - The length of the OTP code (default: 4)
 * @returns {string} The generated OTP code
 * @example
 * generateOTP() // returns "1234"
 * generateOTP(6) // returns "123456"
 */
export const generateOTP = (length: number = 4): string => {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
};
export const sendOtpToEmail = async (
    mailerService: MailerService,
    email: string,
    otp: string,
    subject: string = 'Verify your email',
    template: string = 'verify-account'
): Promise<void> => {
    await mailerService.sendMail({
        to: email,
        subject,
        template,
        context: {
            otp
        }
    });
};
