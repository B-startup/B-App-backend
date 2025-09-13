import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { SocialMediaService } from '../social-media/social-media.service';
import { PostModule } from '../../PostManagement/post/post.module';
import { ExperienceEducationModule } from '../experience_education/experience_education.module';
import { ProjectModule } from '../../ProjectManagement/project/project.module';
import { PrismaService } from 'src/core/services/prisma.service';
import { SecurityModule } from '../../../core/common/security.module';
@Module({
    imports: [
        ConfigModule, 
        SecurityModule, 
        MailerModule,
        PostModule,
        ProjectModule,
        ExperienceEducationModule
    ],
    controllers: [UserController],
    providers: [
        UserService, 
        SocialMediaService, 
        PrismaService
    ],
    exports: [UserService]
})
export class UserModule {}
