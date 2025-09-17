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
import { PostService } from '../../PostManagement/post/post.service';
import { ExperienceEducationService } from '../experience_education/experience_education.service';
import { ProjectService } from '../../ProjectManagement/project/project.service';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly socialMediaService: SocialMediaService,
        private readonly postService: PostService,
        private readonly experienceEducationService: ExperienceEducationService,
        private readonly projectService: ProjectService
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

    @Get('test-cloudinary')
    @ApiOperation({
        summary: '☁️ Test Cloudinary connection',
        description: 'Test endpoint to verify Cloudinary configuration and connection'
    })
    @ApiOkResponse({ 
        description: 'Cloudinary connection test result',
        schema: {
            type: 'object',
            properties: {
                connected: { type: 'boolean' },
                cloudName: { type: 'string' },
                message: { type: 'string' }
            }
        }
    })
    async testCloudinaryConnection() {
        return this.userService.testCloudinaryConnection();
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

    @Get('profile/:id')
    @TokenProtected()
    @ApiOperation({
        summary: 'Get complete user profile',
        description: 'Retrieves complete user profile with all related data: social media, experience & education, posts, and projects'
    })
    @ApiOkResponse({ 
        description: 'Complete user profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    description: 'User basic information and statistics'
                },
                socialMedia: {
                    type: 'array',
                    description: 'User social media links'
                },
                experienceEducation: {
                    type: 'array', 
                    description: 'User experience and education records'
                },
                posts: {
                    type: 'array',
                    description: 'User posts with optimized data'
                },
                projects: {
                    type: 'array',
                    description: 'User projects with optimized data'
                }
            }
        }
    })
    async getUserProfile(@Param('id') id: string) {
        // Utilisateur de base avec statistiques
        const user = await this.userService.findOneWithStats(id);
        
        // Réseaux sociaux de l'utilisateur
        const socialMedia = await this.socialMediaService.findByUserId(id);
        
        // Expérience et éducation
        const experienceEducation = await this.experienceEducationService.findByUser(id);
        
        // Posts de l'utilisateur avec données optimisées
        const posts = await this.postService.findByUserOptimized(id);
        
        // Projets de l'utilisateur avec données optimisées
        const projects = await this.projectService.findByCreatorOptimized(id);

        return {
            user,
            socialMedia,
            experienceEducation,
            posts,
            projects
        };
    }

    @Patch(':id')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '🚀 Complete profile update (User + Social Media)',
        description: 'Update user profile and social media links. All fields are optional for flexible partial updates.'
    })
    @ApiBody({
        description: 'Complete profile update with individual optional fields',
        schema: {
            type: 'object',
            properties: {
                name: { 
                    type: 'string', 
                    example: 'John Doe Updated',
                    description: 'User full name (optional)'
                },
                email: { 
                    type: 'string', 
                    example: 'updated@example.com',
                    description: 'User email address (optional)'
                },
                description: { 
                    type: 'string', 
                    example: 'A passionate full-stack developer',
                    description: 'User bio/description (optional)'
                },
                country: { 
                    type: 'string', 
                    example: 'Tunisia',
                    description: 'User country (optional)'
                },
                city: { 
                    type: 'string', 
                    example: 'Tunis',
                    description: 'User city (optional)'
                },
                phone: { 
                    type: 'string', 
                    example: '+216 20 123 456',
                    description: 'User phone number (optional)'
                },
                webSite: { 
                    type: 'string', 
                    example: 'https://johndoe.dev',
                    description: 'User website URL (optional)'
                },
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (optional - JPEG, PNG, GIF, WebP max 2MB)'
                },
                socialMediaLinks: {
                    type: 'string',
                    example: '[{"platform":"INSTAGRAM","url":"https://instagram.com/johndoe"},{"platform":"FACEBOOK","url":"https://facebook.com/johndoe"}]',
                    description: 'JSON array string of social media links (optional). Each object should have: platform (FACEBOOK|INSTAGRAM|LINKEDIN|TWITTER|YOUTUBE|TIKTOK|GITHUB|WEBSITE) and url'
                }
            }
        }
    })
    @ApiOkResponse({
        description: 'Profile updated successfully with complete user data and all social media links',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'user-uuid' },
                name: { type: 'string', example: 'John Doe Updated' },
                email: { type: 'string', example: 'updated@example.com' },
                description: { type: 'string', example: 'A passionate full-stack developer' },
                country: { type: 'string', example: 'Tunisia' },
                city: { type: 'string', example: 'Tunis' },
                phone: { type: 'string', example: '+216 20 123 456' },
                webSite: { type: 'string', example: 'https://johndoe.dev' },
                profilePicture: { type: 'string', example: 'https://example.com/profile.jpg' },
                nbFollowers: { type: 'number', example: 150 },
                nbFollowing: { type: 'number', example: 75 },
                nbPosts: { type: 'number', example: 42 },
                nbProjects: { type: 'number', example: 8 },
                socialMedias: {
                    type: 'array',
                    description: 'Complete list of all user social media links',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'social-media-uuid' },
                            platform: { type: 'string', example: 'FACEBOOK' },
                            url: { type: 'string', example: 'https://facebook.com/johndoe' },
                            createdAt: { type: 'string', example: '2025-09-13T15:30:00Z' },
                            updatedAt: { type: 'string', example: '2025-09-13T15:30:00Z' }
                        }
                    }
                },
                message: { type: 'string', example: 'Profile updated successfully' }
            }
        }
    })
    async update(
        @Param('id') id: string,
        @Body() updateData: UpdateUserDto & { socialMediaLinks?: string },
        @UploadedFile() profileImage?: Express.Multer.File
    ) {
        // Extract socialMediaLinks from direct form fields
        const { socialMediaLinks, ...userUpdateData } = updateData;

        const parsedSocialMediaLinks = this.parseSocialMediaLinks(socialMediaLinks);
        await this.updateUserProfile(id, userUpdateData, profileImage);
        await this.updateSocialMediaLinks(id, parsedSocialMediaLinks);

        const userWithStats = await this.userService.findOneWithStats(id);
        
        // Récupérer toute la liste des réseaux sociaux de l'utilisateur
        const allUserSocialMedias = await this.socialMediaService.findByUserId(id);
        
        return {
            ...userWithStats,
            socialMedias: allUserSocialMedias,
            message: 'Profile updated successfully'
        };
    }

    private parseSocialMediaLinks(socialMediaLinks?: string): any {
        if (!socialMediaLinks || typeof socialMediaLinks !== 'string') {
            return [];
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
                sm =>  sm.platform === platform
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
