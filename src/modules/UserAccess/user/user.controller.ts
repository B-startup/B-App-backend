import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseInterceptors,
    Query,
    BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiConsumes,
    ApiBody,
    ApiBearerAuth
} from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import { UserService } from './user.service';
import { SocialMediaService } from '../social-media/social-media.service';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly socialMediaService: SocialMediaService
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Create new user',
        description: 'Creates a new user with the provided data'
    })
    @ApiCreatedResponse({
        description: 'User has been created successfully'
    })
    create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.userService.createUser(createUserDto);
    }

    @Get()
    @TokenProtected()
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieves a list of all registered users'
    })
    @ApiOkResponse({ description: 'List of all users' })
    findAll(): Promise<UserResponseDto[]> {
        return this.userService.findAllWithStats();
    }

    @Get('search')
    @TokenProtected()
    @ApiOperation({
        summary: '🔍 Advanced user search',
        description: 'Advanced search across multiple user fields (name, email, country, city, website) with a single search input'
    })
    @ApiOkResponse({
        description: 'Users found successfully'
    })
    async advancedSearch(
        @Query('q') searchQuery?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.userService.advancedSearch({
            searchQuery,
            page,
            limit
        });
    }

    @Get(':id')
    @TokenProtected()
    @ApiOperation({
        summary: 'Get user by id',
        description: 'Retrieves a specific user (posts, projects, offers, etc.)'
    })
    @ApiOkResponse({ description: 'User found' })
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.findOneWithStats(id);
    }

    @Patch(':id')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '🚀 Complete profile update (User + Social Media)',
        description: 'Update user profile and social media links in one optimized request.'
    })
    @ApiBody({
        description: 'Complete profile update with social media links',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe Updated' },
                email: { type: 'string', example: 'updated@example.com' },
                description: { type: 'string', example: 'A passionate developer' },
                country: { type: 'string', example: 'Tunisia' },
                city: { type: 'string', example: 'Tunis' },
                phone: { type: 'string', example: '+216 20 123 456' },
                webSite: { type: 'string', example: 'https://example.com' },
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (JPEG, PNG, GIF, WebP max 2MB)'
                },
                socialMediaLinks: {
                    type: 'string',
                    example: '[{"platform":"FACEBOOK","url":"https://facebook.com/user"},{"platform":"INSTAGRAM","url":"https://instagram.com/user"}]',
                    description: 'JSON array as string. Each object should have: platform (FACEBOOK|INSTAGRAM|LINKEDIN|TWITTER|YOUTUBE|TIKTOK|GITHUB|WEBSITE) and url'
                }
            }
        }
    })
    @ApiOkResponse({
        description: 'Profile updated successfully with social media links'
    })
    async update(
        @Param('id') id: string,
        @Body() updateData: UpdateUserDto & { socialMediaLinks?: string },
        @UploadedFile() profileImage?: Express.Multer.File
    ) {
        const { socialMediaLinks, ...userUpdateData } = updateData;

        const parsedSocialMediaLinks = this.parseSocialMediaLinks(socialMediaLinks);
        await this.updateUserProfile(id, userUpdateData, profileImage);
        const updatedSocialMedias = await this.updateSocialMediaLinks(id, parsedSocialMediaLinks);

        const userWithStats = await this.userService.findOneWithStats(id);
        return {
            ...userWithStats,
            socialMedias: updatedSocialMedias,
            message: 'Profile updated successfully'
        };
    }

    private parseSocialMediaLinks(socialMediaLinks?: string): any {
        if (!socialMediaLinks || typeof socialMediaLinks !== 'string') {
            return socialMediaLinks;
        }

        try {
            return JSON.parse(socialMediaLinks);
        } catch {
            throw new BadRequestException('Invalid socialMediaLinks format. Must be a valid JSON array.');
        }
    }

    private async updateUserProfile(
        id: string,
        userUpdateData: UpdateUserDto,
        profileImage?: Express.Multer.File
    ): Promise<void> {
        if (profileImage) {
            await this.userService.updateWithProfileImage(id, userUpdateData, profileImage);
        } else {
            await this.userService.update(id, userUpdateData);
        }
    }

    private async updateSocialMediaLinks(id: string, parsedSocialMediaLinks: any): Promise<any[]> {
        const updatedSocialMedias = [];
        if (!parsedSocialMediaLinks || !Array.isArray(parsedSocialMediaLinks)) {
            return updatedSocialMedias;
        }

        for (const socialMediaData of parsedSocialMediaLinks) {
            const updatedSocialMedia = await this.processSocialMediaUpdate(id, socialMediaData);
            if (updatedSocialMedia) {
                updatedSocialMedias.push(updatedSocialMedia);
            }
        }
        return updatedSocialMedias;
    }

    private async processSocialMediaUpdate(id: string, socialMediaData: any): Promise<any | null> {
        const { platform, url } = socialMediaData;
        
        try {
            const existingSocialMedias = await this.socialMediaService.findAll();
            const existingSocialMedia = existingSocialMedias.find(
                sm => sm.userId === id && sm.platform === platform
            );

            if (existingSocialMedia) {
                return await this.socialMediaService.update(existingSocialMedia.id, { url });
            } else {
                return await this.socialMediaService.create({
                    userId: id,
                    platform,
                    url
                });
            }
        } catch (error) {
            console.warn(`Failed to process social media ${platform}:`, error.message);
            return null;
        }
    }

    @Delete(':id/profile-image')
    @TokenProtected()
    @ApiOperation({
        summary: '🗑️ Remove profile image',
        description: 'Remove the profile image for a user'
    })
    @ApiOkResponse({
        description: 'Profile image removed successfully'
    })
    async removeProfileImage(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.removeProfileImage(id);
    }

    @Get('stats/overview')
    @TokenProtected()
    @ApiOperation({
        summary: '📊 Get user statistics',
        description: 'Get comprehensive user statistics for admin dashboard'
    })
    @ApiOkResponse({ description: 'User statistics retrieved successfully' })
    async getUserStats() {
        return this.userService.getUserStats();
    }

    @Delete(':id')
    @TokenProtected()
    @ApiOperation({
        summary: 'Delete user',
        description: 'Removes a user from the system'
    })
    @ApiOkResponse({
        description: 'User has been deleted successfully'
    })
    remove(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.removeUser(id);
    }
}
