import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { TokenProtected } from '../common/decorators/token-protected.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Token Management')
@Controller('token-management')
@TokenProtected() // Protection globale du contrôleur
export class TokenManagementController {
    constructor(
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    @Get('blacklist/stats')
    @ApiOperation({ summary: 'Get blacklist statistics (Admin)' })
    @ApiResponse({
        status: 200,
        description: 'Blacklist statistics retrieved successfully'
    })
    @ApiResponse({ status: 401, description: 'Unauthorized access' })
    async getBlacklistStats(@CurrentUser() user: any) {
        const stats = await this.tokenBlacklistService.getBlacklistStats();
        return {
            ...stats,
            requestedBy: user.email,
            timestamp: new Date().toISOString()
        };
    }

    @Post('blacklist/cleanup')
    @ApiOperation({ summary: 'Clean up expired tokens from blacklist (Admin)' })
    @ApiResponse({ status: 200, description: 'Cleanup completed successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized access' })
    async cleanupExpiredTokens(@CurrentUser() user: any) {
        const deletedCount =
            await this.tokenBlacklistService.cleanupExpiredTokens();
        return {
            message: 'Cleanup completed successfully',
            deletedCount,
            performedBy: user.email,
            timestamp: new Date().toISOString()
        };
    }
}
