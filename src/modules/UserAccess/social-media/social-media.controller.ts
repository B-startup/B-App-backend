import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth
} from '@nestjs/swagger';
import { SocialMediaService } from './social-media.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { SocialMediaResponseDto } from './dto/social-media-response.dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Social Media')
@ApiBearerAuth()
@Controller('social-media')
export class SocialMediaController {
    constructor(private readonly socialMediaService: SocialMediaService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a new social media link' })
    @ApiResponse({
        status: 201,
        description: 'Social media link created successfully',
        type: SocialMediaResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'User already has this platform' })
    async create(@Body() createSocialMediaDto: CreateSocialMediaDto): Promise<SocialMediaResponseDto> {
        return await this.socialMediaService.create(createSocialMediaDto);
    }

    @TokenProtected()
    @Get()
    @ApiOperation({ summary: 'Get all social media links' })
    @ApiResponse({
        status: 200,
        description: 'Social media links retrieved successfully',
        type: [SocialMediaResponseDto]
    })
    async findAll(): Promise<SocialMediaResponseDto[]> {
        return await this.socialMediaService.findAll();
    }

    @TokenProtected()
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all social media links for a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User social media links retrieved successfully',
        type: [SocialMediaResponseDto]
    })
    async findByUserId(@Param('userId') userId: string): Promise<SocialMediaResponseDto[]> {
        return await this.socialMediaService.findByUserId(userId);
    }

    @TokenProtected()
    @Get(':id')
    @ApiOperation({ summary: 'Get social media link by ID' })
    @ApiParam({ name: 'id', description: 'Social media link ID' })
    @ApiResponse({
        status: 200,
        description: 'Social media link retrieved successfully',
        type: SocialMediaResponseDto
    })
    @ApiResponse({ status: 404, description: 'Social media link not found' })
    async findOne(@Param('id') id: string): Promise<SocialMediaResponseDto> {
        return await this.socialMediaService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update social media link' })
    @ApiParam({ name: 'id', description: 'Social media link ID' })
    @ApiResponse({
        status: 200,
        description: 'Social media link updated successfully',
        type: SocialMediaResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Social media link not found' })
    async update(
        @Param('id') id: string,
        @Body() updateSocialMediaDto: UpdateSocialMediaDto
    ): Promise<SocialMediaResponseDto> {
        return await this.socialMediaService.update(id, updateSocialMediaDto);
    }

    @TokenProtected()
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete social media link' })
    @ApiParam({ name: 'id', description: 'Social media link ID' })
    @ApiResponse({
        status: 204,
        description: 'Social media link deleted successfully'
    })
    @ApiResponse({ status: 404, description: 'Social media link not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.socialMediaService.remove(id);
    }
}
