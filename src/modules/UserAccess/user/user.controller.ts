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
        summary: '🔄 Update user with optional profile image',
        description: 'Updates user information including all fields with optional profile image upload'
    })
    @ApiBody({
        description: 'User update data with optional profile image',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe Updated' },
                email: { type: 'string', example: 'updated@example.com' },
                password: { type: 'string', example: 'NewStrongPass123!' },
                description: { type: 'string', example: 'A passionate developer interested in tech innovations' },
                country: { type: 'string', example: 'Tunisia' },
                city: { type: 'string', example: 'Tunis' },
                birthdate: { type: 'string', example: '1990-01-15', description: 'Date in YYYY-MM-DD format' },
                phone: { type: 'string', example: '+216 20 123 456' },
                webSite: { type: 'string', example: 'https://example.com' },
                profileImage: {
                    type: 'string',
                    format: 'binary',
                    description: 'New profile image file (JPEG, PNG, GIF, WebP max 2MB)'
                }
            }
        }
    })
    @ApiOkResponse({
        description: 'User updated successfully with optional profile image'
    })
    async updateWithProfileImage(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile() profileImage?: Express.Multer.File
    ): Promise<UserResponseDto> {
        return this.userService.updateWithProfileImage(id, updateUserDto, profileImage);
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
