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
    Query
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
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

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

    @Post('with-profile-image')
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '📸 Create user with profile image ( à supprimer)',
        description: 'Creates a new user with optional profile image upload'
    })
    @ApiBody({
        description: 'User data with optional profile image',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'StrongPass123!' },
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (JPEG, PNG, GIF, WebP max 2MB)'
                }
            },
            required: ['name', 'email', 'password']
        }
    })
    @ApiCreatedResponse({
        description: 'User created successfully with profile image'
    })
    async createWithProfileImage(
        @Body() createUserDto: CreateUserDto,
        @UploadedFile() profileImage?: Express.Multer.File
    ): Promise<UserResponseDto> {
        return this.userService.createWithProfileImage(createUserDto, profileImage);
    }

    @Get()
    @TokenProtected()
    @ApiOperation({
        summary: 'Get all users with statistics',
        description: 'Retrieves a list of all registered users with their comprehensive statistics'
    })
    @ApiOkResponse({ description: 'List of all users with statistics' })
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
        summary: 'Get user by id with detailed statistics',
        description: 'Retrieves a specific user with comprehensive statistics (posts, projects, offers, etc.)'
    })
    @ApiOkResponse({ description: 'User found with detailed statistics' })
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.findOneWithStats(id);
    }

    @Patch(':id')
    @TokenProtected()
    @ApiOperation({
        summary: 'Update user',
        description: "Updates an existing user's information"
    })
    @ApiOkResponse({
        description: 'User has been updated successfully'
    })
    update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Patch(':id/with-profile-image')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '🔄 Update user with profile image ( à supprimer)',
        description: 'Updates user information with optional profile image upload'
    })
    @ApiBody({
        description: 'User update data with optional profile image',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe Updated' },
                email: { type: 'string', example: 'updated@example.com' },
                password: { type: 'string', example: 'NewStrongPass123!' },
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'New profile image file (JPEG, PNG, GIF, WebP max 2MB)'
                }
            }
        }
    })
    @ApiOkResponse({
        description: 'User updated successfully with profile image'
    })
    async updateWithProfileImage(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile() profileImage?: Express.Multer.File
    ): Promise<UserResponseDto> {
        return this.userService.updateWithProfileImage(id, updateUserDto, profileImage);
    }

    @Post(':id/profile-image')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '📸 Upload profile image',
        description: 'Upload or update profile image for an existing user'
    })
    @ApiBody({
        description: 'Profile image file',
        schema: {
            type: 'object',
            properties: {
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'Profile image file (JPEG, PNG, GIF, WebP max 2MB)'
                }
            },
            required: ['profileImage']
        }
    })
    @ApiCreatedResponse({
        description: 'Profile image uploaded successfully'
    })
    async uploadProfileImage(
        @Param('id') id: string,
        @UploadedFile() profileImage: Express.Multer.File
    ): Promise<UserResponseDto> {
        return this.userService.uploadProfileImage(id, profileImage);
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

    @Post(':id/complete-profile')
    @TokenProtected()
    @ApiOperation({
        summary: '✅ Mark profile as complete',
        description: 'Mark user profile as complete if all required fields are filled'
    })
    @ApiOkResponse({ description: 'Profile marked as complete' })
    async markProfileAsComplete(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.markProfileAsComplete(id);
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
