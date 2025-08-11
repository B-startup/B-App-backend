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
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
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
        return this.userService.create(createUserDto);
    }

    @Post('with-profile-image')
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '📸 Create user with profile image',
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
        summary: 'Get all users',
        description: 'Retrieves a list of all registered users'
    })
    @ApiOkResponse({ description: 'List of all users' })
    findAll(): Promise<UserResponseDto[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    @TokenProtected()
    @ApiOperation({
        summary: 'Get user by id',
        description: 'Retrieves a specific user by their unique identifier'
    })
    @ApiOkResponse({ description: 'User found' })
    findOne(@Param('id') id: string): Promise<UserResponseDto> {
        return this.userService.findOne(id);
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
        return this.userService.update(id, updateUserDto);
    }

    @Patch(':id/with-profile-image')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('profileImage'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: '🔄 Update user with profile image',
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

    @Get('search')
    @TokenProtected()
    @ApiOperation({
        summary: '🔍 Search users',
        description: 'Search users with filters and pagination'
    })
    @ApiOkResponse({
        description: 'Users found successfully'
    })
    async searchUsers(
        @Query('search') search?: string,
        @Query('country') country?: string,
        @Query('city') city?: string,
        @Query('role') role?: string,
        @Query('isEmailVerified') isEmailVerified?: boolean,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.userService.findUsers({
            search,
            country,
            city,
            role,
            isEmailVerified,
            page,
            limit
        });
    }

    @Get('email/:email')
    @TokenProtected()
    @ApiOperation({
        summary: '📧 Find user by email',
        description: 'Find a specific user by email address'
    })
    @ApiOkResponse({ description: 'User found by email' })
    async findByEmail(@Param('email') email: string): Promise<UserResponseDto | null> {
        return this.userService.findByEmail(email);
    }

    @Patch(':id/profile')
    @TokenProtected()
    @ApiOperation({
        summary: '👤 Update user profile',
        description: 'Update user profile (limited fields for self-update)'
    })
    @ApiOkResponse({ description: 'Profile updated successfully' })
    async updateProfile(
        @Param('id') id: string,
        @Body() updateDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        return this.userService.updateProfile(id, updateDto);
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
        return this.userService.remove(id);
    }
}
