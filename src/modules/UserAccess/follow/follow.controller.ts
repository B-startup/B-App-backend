import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { Follow } from '@prisma/client';
import { FollowService } from './follow.service';
import { 
    CreateFollowDto, 
    UpdateFollowDto, 
    FollowResponseDto, 
    FollowWithUserDetailsDto,
    ToggleFollowDto
} from './dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Follow Management')
@Controller('follow')
export class FollowController {
    constructor(private readonly followService: FollowService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @TokenProtected()
    @ApiOperation({ summary: 'Create a new follow relationship' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Follow relationship created successfully',
        type: FollowResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Follow relationship already exists or user trying to follow themselves',
    })
    async create(@Body() createFollowDto: CreateFollowDto): Promise<FollowResponseDto> {
        return this.followService.createFollow(createFollowDto);
    }

    @Get()
    @TokenProtected()
    @ApiOperation({ summary: 'Get all follow relationships' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow relationships retrieved successfully',
        type: [FollowResponseDto],
    })
    async findAll(): Promise<FollowResponseDto[]> {
        return this.followService.findAllFollows();
    }

    @Get('check')
    @TokenProtected()
    @ApiOperation({ summary: 'Check if one user is following another' })
    @ApiQuery({
        name: 'followerId',
        description: 'ID of the follower',
        type: 'string',
    })
    @ApiQuery({
        name: 'followingId',
        description: 'ID of the user being followed',
        type: 'string',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow status checked successfully',
    })
    async isFollowing(
        @Query('followerId') followerId: string,
        @Query('followingId') followingId: string
    ): Promise<{ isFollowing: boolean }> {
        // Validation manuelle des UUIDs
        if (!followerId || !followingId) {
            throw new BadRequestException('followerId et followingId sont requis');
        }
        
        // Validation du format UUID (simple)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(followerId) || !uuidRegex.test(followingId)) {
            throw new BadRequestException('followerId et followingId doivent être des UUIDs valides');
        }
        
        const isFollowing = await this.followService.isFollowing(followerId, followingId);
        return { isFollowing };
    }

    @Post('toggle')
    @HttpCode(HttpStatus.OK)
    @TokenProtected()
    @ApiOperation({ summary: 'Toggle follow relationship between two users' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow relationship toggled successfully',
    })
    async toggleFollow(
        @Body() toggleFollowDto: ToggleFollowDto
    ): Promise<{ isFollowing: boolean; follow?: FollowResponseDto }> {
        return this.followService.toggleFollow(
            toggleFollowDto.followerId, 
            toggleFollowDto.followingId
        );
    }

    @Get(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Get a follow relationship by ID' })
    @ApiParam({
        name: 'id',
        description: 'Follow relationship ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow relationship retrieved successfully',
        type: FollowResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Follow relationship not found',
    })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<FollowResponseDto> {
        return this.followService.findFollowById(id);
    }

    @Patch(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Update a follow relationship' })
    @ApiParam({
        name: 'id',
        description: 'Follow relationship ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow relationship updated successfully',
        type: FollowResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Follow relationship not found',
    })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateFollowDto: UpdateFollowDto
    ): Promise<Follow> {
        return this.followService.update(id, updateFollowDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @TokenProtected()
    @ApiOperation({ summary: 'Remove a follow relationship' })
    @ApiParam({
        name: 'id',
        description: 'Follow relationship ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow relationship removed successfully',
        type: FollowResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Follow relationship not found',
    })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<FollowResponseDto> {
        return this.followService.removeFollow(id);
    }

    // Routes spécifiques pour les fonctionnalités de suivi

    @Get('user/:userId/following')
    @TokenProtected()
    @ApiOperation({ summary: 'Get users that a specific user is following' })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Following users retrieved successfully',
        type: [FollowWithUserDetailsDto],
    })
    async getFollowing(
        @Param('userId', ParseUUIDPipe) userId: string
    ): Promise<FollowWithUserDetailsDto[]> {
        return this.followService.getFollowing(userId);
    }

    @Get('user/:userId/followers')
    @TokenProtected()
    @ApiOperation({ summary: 'Get users that are following a specific user' })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Followers retrieved successfully',
        type: [FollowWithUserDetailsDto],
    })
    async getFollowers(
        @Param('userId', ParseUUIDPipe) userId: string
    ): Promise<FollowWithUserDetailsDto[]> {
        return this.followService.getFollowers(userId);
    }

    @Get('user/:userId/stats')
    @TokenProtected()
    @ApiOperation({ summary: 'Get follow statistics for a user' })
    @ApiParam({
        name: 'userId',
        description: 'User ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Follow statistics retrieved successfully',
    })
    async getFollowStats(
        @Param('userId', ParseUUIDPipe) userId: string
    ): Promise<{ followersCount: number; followingCount: number }> {
        return this.followService.getFollowStats(userId);
    }

    @Get('mutual/:userId1/:userId2')
    @TokenProtected()
    @ApiOperation({ summary: 'Get mutual follows between two users' })
    @ApiParam({
        name: 'userId1',
        description: 'First user ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiParam({
        name: 'userId2',
        description: 'Second user ID',
        type: 'string',
        format: 'uuid',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Mutual follows retrieved successfully',
        type: [FollowWithUserDetailsDto],
    })
    async getMutualFollows(
        @Param('userId1', ParseUUIDPipe) userId1: string,
        @Param('userId2', ParseUUIDPipe) userId2: string
    ): Promise<FollowWithUserDetailsDto[]> {
        return this.followService.getMutualFollows(userId1, userId2);
    }
}
