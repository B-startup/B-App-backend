import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { 
    CreateFollowDto, 
    FollowResponseDto,
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
    })
    async getFollowing(
        @Param('userId', ParseUUIDPipe) userId: string
    ): Promise<any[]> {
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
    })
    async getFollowers(
        @Param('userId', ParseUUIDPipe) userId: string
    ): Promise<any[]> {
        return this.followService.getFollowers(userId);
    }
}
