import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class TokenCleanupTask {
    private readonly logger = new Logger(TokenCleanupTask.name);

    constructor(
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async handleTokenCleanup() {
        this.logger.log('Starting token blacklist cleanup...');

        try {
            const deletedCount =
                await this.tokenBlacklistService.cleanupExpiredTokens();
            this.logger.log(
                `Token cleanup completed. Deleted ${deletedCount} expired tokens.`
            );
        } catch (error) {
            this.logger.error('Error during token cleanup:', error);
        }
    }
}
