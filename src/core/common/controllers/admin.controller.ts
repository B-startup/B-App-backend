import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiQuery, 
    ApiParam,
    ApiBearerAuth 
} from '@nestjs/swagger';
import { TokenBlacklistService } from '../../services/token-blacklist.service';
import { TokenProtected } from '../decorators/token-protected.decorator';

@ApiTags('Administration - Token Management')
@ApiBearerAuth()
@Controller('admin/tokens')
export class AdminController {
    constructor(
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    @TokenProtected()
    @Get('blacklist/stats')
    @ApiOperation({ summary: 'Get blacklist statistics' })
    @ApiResponse({ 
        status: 200, 
        description: 'Blacklist statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number', description: 'Total blacklisted tokens' },
                active: { type: 'number', description: 'Active blacklisted tokens' },
                expired: { type: 'number', description: 'Expired blacklisted tokens' }
            }
        }
    })
    async getBlacklistStats() {
        return await this.tokenBlacklistService.getBlacklistStats();
    }

    @TokenProtected()
    @Get('blacklist/history')
    @ApiOperation({ summary: 'Get blacklist history for audit' })
    @ApiQuery({ 
        name: 'days', 
        required: false, 
        description: 'Number of days to look back (default: 7)',
        type: Number 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Blacklist history retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    tokenHash: { type: 'string' },
                    userId: { type: 'string', nullable: true },
                    reason: { type: 'string' },
                    blacklistedAt: { type: 'string', format: 'date-time' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: ['active', 'expired'] }
                }
            }
        }
    })
    async getBlacklistHistory(@Query('days') days?: string) {
        const daysNumber = days ? parseInt(days, 10) : 7;
        return await this.tokenBlacklistService.getBlacklistHistory(daysNumber);
    }

    @TokenProtected()
    @Get('blacklist/user/:userId')
    @ApiOperation({ summary: 'Get blacklist statistics for a specific user' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'User blacklist statistics retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                total: { type: 'number' },
                active: { type: 'number' },
                expired: { type: 'number' },
                reasons: { 
                    type: 'object',
                    additionalProperties: { type: 'number' },
                    description: 'Count by reason'
                }
            }
        }
    })
    async getUserBlacklistStats(@Param('userId') userId: string) {
        return await this.tokenBlacklistService.getBlacklistStatsByUser(userId);
    }

    @TokenProtected()
    @Post('cleanup')
    @ApiOperation({ summary: 'Manually cleanup expired tokens more 30 days ago' })
    @ApiResponse({ 
        status: 200, 
        description: 'Cleanup completed successfully',
        schema: {
            type: 'object',
            properties: {
                deleted: { type: 'number', description: 'Number of tokens deleted' },
                stats: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        active: { type: 'number' },
                        expired: { type: 'number' }
                    }
                }
            }
        }
    })
    async manualCleanup() {
        const deletedCount = await this.tokenBlacklistService.cleanupExpiredTokens();
        const stats = await this.tokenBlacklistService.getBlacklistStats();
        
        return {
            deleted: deletedCount,
            stats
        };
    }

    @TokenProtected()
    @Post('cleanup/test-immediate')
    @ApiOperation({ 
        summary: '🧪 TEST ONLY - Cleanup ALL expired tokens immediately',
        description: '⚠️ This endpoint bypasses the 30-day grace period and deletes ALL expired tokens immediately. Use ONLY for testing!'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Test cleanup completed successfully',
        schema: {
            type: 'object',
            properties: {
                deleted: { type: 'number', description: 'Number of tokens deleted immediately' },
                stats: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        active: { type: 'number' },
                        expired: { type: 'number' }
                    }
                },
                warning: { type: 'string' }
            }
        }
    })
    async testImmediateCleanup() {
        const deletedCount = await this.tokenBlacklistService.testCleanupAllExpiredTokens();
        const stats = await this.tokenBlacklistService.getBlacklistStats();
        
        return {
            deleted: deletedCount,
            stats,
            warning: '🧪 This was a TEST cleanup that bypassed the 30-day grace period'
        };
    }

    @TokenProtected()
    @Get('blacklist/health')
    @ApiOperation({ summary: 'Check blacklist system health' })
    @ApiResponse({ 
        status: 200, 
        description: 'Blacklist system health status',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', enum: ['healthy', 'warning', 'critical'] },
                message: { type: 'string' },
                stats: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        active: { type: 'number' },
                        expired: { type: 'number' }
                    }
                },
                recommendations: {
                    type: 'array',
                    items: { type: 'string' }
                }
            }
        }
    })
    async checkHealth() {
        const stats = await this.tokenBlacklistService.getBlacklistStats();
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        let message = 'Blacklist system is operating normally';
        const recommendations: string[] = [];

        // Analyse de la santé
        if (stats.total > 10000) {
            status = 'warning';
            message = 'Large number of blacklisted tokens detected';
            recommendations.push('Consider running cleanup to remove old expired tokens');
        }

        if (stats.expired > stats.active * 2) {
            if (status === 'healthy') status = 'warning';
            message = 'High ratio of expired tokens';
            recommendations.push('Run cleanup to improve performance');
        }

        if (stats.total > 50000) {
            status = 'critical';
            message = 'Critical: Very large blacklist detected';
            recommendations.push('Immediate cleanup required');
            recommendations.push('Consider implementing more aggressive cleanup policies');
        }

        return {
            status,
            message,
            stats,
            recommendations
        };
    }
}
