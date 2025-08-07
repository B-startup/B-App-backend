import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class TokenCleanupService {
    private readonly logger = new Logger(TokenCleanupService.name);

    constructor(
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    /**
     * Nettoie les tokens expirés toutes les 6 heures
     */
    @Cron(CronExpression.EVERY_6_HOURS)
    async cleanupExpiredTokens(): Promise<void> {
        try {
            this.logger.log('Starting cleanup of expired tokens...');
            
            const deletedCount = await this.tokenBlacklistService.cleanupExpiredTokens();
            
            this.logger.log(`Cleaned up ${deletedCount} expired tokens`);
        } catch (error) {
            this.logger.error('Failed to cleanup expired tokens:', error);
        }
    }

    /**
     * Nettoie les tokens expirés tous les jours à minuit
     */
    @Cron('0 0 * * *') // Tous les jours à minuit
    async dailyTokenCleanup(): Promise<void> {
        try {
            this.logger.log('Starting daily token cleanup...');
            
            const stats = await this.tokenBlacklistService.getBlacklistStats();
            this.logger.log(`Blacklist stats before cleanup - Total: ${stats.total}, Expired: ${stats.expired}, Active: ${stats.active}`);
            
            const deletedCount = await this.tokenBlacklistService.cleanupExpiredTokens();
            
            const newStats = await this.tokenBlacklistService.getBlacklistStats();
            this.logger.log(`Daily cleanup completed - Deleted: ${deletedCount}, Remaining: ${newStats.total}`);
        } catch (error) {
            this.logger.error('Failed during daily token cleanup:', error);
        }
    }

    /**
     * Méthode manuelle pour nettoyer les tokens (utile pour les tests ou maintenance)
     */
    async manualCleanup(): Promise<{ deleted: number; stats: any }> {
        const deletedCount = await this.tokenBlacklistService.cleanupExpiredTokens();
        const stats = await this.tokenBlacklistService.getBlacklistStats();
        
        return {
            deleted: deletedCount,
            stats
        };
    }

    /**
     * 🧪 MÉTHODE DE TEST - Nettoie TOUS les tokens expirés immédiatement
     * À utiliser UNIQUEMENT pour les tests !
     */
    async testImmediateCleanup(): Promise<{ deleted: number; stats: any }> {
        this.logger.warn('🧪 TEST MODE: Immediate cleanup of ALL expired tokens');
        
        const deletedCount = await this.tokenBlacklistService.testCleanupAllExpiredTokens();
        const stats = await this.tokenBlacklistService.getBlacklistStats();
        
        this.logger.log(`🧪 TEST: Deleted ${deletedCount} expired tokens immediately`);
        
        return {
            deleted: deletedCount,
            stats
        };
    }
}
