import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { LoggerMiddleware } from './core/common/middleware/logger.middleware';
import { PrismaService } from './core/services/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { UserModule } from './modules/user/user.module';
import { SectorModule } from './modules/sector/sector.module';
import { TagModule } from './modules/tag/tag.module';
import { TeamModule } from './modules/team/team.module';
import { ProjectModule } from './modules/project/project.module';
import { SocialMediaModule } from './modules/social-media/social-media.module';
import { ExperienceEducationModule } from './modules/experience_education/experience_education.module';
import { InterestsModule } from './modules/interests/interests.module';
import { TeamUsersModule } from './modules/team-users/team-users.module';
import { FileModule } from './modules/file/file.module';
import { ProjectTagModule } from './modules/project-tag/project-tag.module';
import { PostTagModule } from './modules/post-tag/post-tag.module';
import { PostSectorModule } from './modules/post-sector/post-sector.module';
import { UseOfFundsModule } from './modules/use-of-funds/use-of-funds.module';
import { PartnershipModule } from './modules/partnership/partnership.module';
import { LikeModule } from './modules/like/like.module';
import { CommentModule } from './modules/comment/comment.module';
import { FollowModule } from './modules/follow/follow.module';
import { ViewModule } from './modules/view/view.module';
import { ConnectModule } from './modules/connect/connect.module';
import { AttemptLogModule } from './modules/attempt_log/attempt_log.module';
import { NotificationModule } from './modules/notification/notification.module';
import { VisitorProfileProjectModule } from './modules/visitor-profile-project/visitor-profile-project.module';
import { PostModule } from './modules/post/post.module';
import { PostMediaModule } from './modules/post-media/post-media.module';
import { PostSharedModule } from './modules/post-shared/post-shared.module';
import { DiscussionModule } from './modules/discussion/discussion.module';
import { MessageModule } from './modules/message/message.module';

@Module({
    imports: [
        // Environment Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            cache: true
        }),

        // Rate Limiting
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => [
                {
                    ttl: config.get('THROTTLE_TTL', 60),
                    limit: config.get('THROTTLE_LIMIT', 100)
                }
            ]
        }),

        // Email Configuration
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                transport: {
                    host: config.get<string>('EMAIL_HOST'),
                    port: config.get<number>('EMAIL_PORT'),
                    secure: false, // Set to true if using SSL (port 465)
                    auth: {
                        user: config.get<string>('EMAIL_USER'),
                        pass: config.get<string>('EMAIL_PASSWORD')
                    }
                },
                defaults: {
                    from: `"No Reply" <${config.get<string>('EMAIL_FROM')}>`
                },
                template: {
                    dir: join(__dirname, 'templates'),
                    adapter: new HandlebarsAdapter()
                }
            })
        }),

        FileUploadModule,
        AuthModule,
        UserModule,
        SectorModule,
        TagModule,
        TeamModule,
        ProjectModule,
        SocialMediaModule,
        ExperienceEducationModule,
        InterestsModule,
        TeamUsersModule,
        FileModule,
        ProjectTagModule,
        PostTagModule,
        PostSectorModule,
        UseOfFundsModule,
        PartnershipModule,
        LikeModule,
        CommentModule,
        FollowModule,
        ViewModule,
        ConnectModule,
        AttemptLogModule,
        NotificationModule,
        VisitorProfileProjectModule,
        PostModule,
        PostMediaModule,
        PostSharedModule,
        DiscussionModule,
        MessageModule
    ],
    controllers: [],
    providers: [PrismaService]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
