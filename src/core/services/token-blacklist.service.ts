import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class TokenBlacklistService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Hash a token for secure storage
     */
    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    /**
     * Add a token to the blacklist
     */
    async blacklistToken(
        token: string,
        userId?: string,
        reason: string = 'logout'
    ): Promise<void> {
        try {
            // Decode token to get expiration
            const decoded = this.jwtService.decode(token);
            const expiresAt = decoded?.exp
                ? new Date(decoded.exp * 1000)
                : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24h

            const tokenHash = this.hashToken(token);

            await this.prisma.tokenBlacklist.create({
                data: {
                    tokenHash,
                    userId,
                    reason,
                    expiresAt,
                    blacklistedAt: new Date()
                }
            });
        } catch (error) {
            // Si le token est malformé, on l'ajoute quand même avec une expiration par défaut
            console.error('Error decoding token for blacklist:', error);
            const tokenHash = this.hashToken(token);
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await this.prisma.tokenBlacklist.create({
                data: {
                    tokenHash,
                    userId,
                    reason,
                    expiresAt,
                    blacklistedAt: new Date()
                }
            });
        }
    }

    /**
     * Check if a token is blacklisted
     * Only checks active (non-expired) blacklisted tokens
     */
    async isTokenBlacklisted(token: string): Promise<boolean> {
        const tokenHash = this.hashToken(token);
        const now = new Date();

        const blacklistedToken = await this.prisma.tokenBlacklist.findFirst({
            where: { 
                tokenHash,
                expiresAt: { gt: now } // Only check non-expired blacklisted tokens
            }
        });

        return !!blacklistedToken;
    }

    /**
     * Blacklist all tokens for a specific user (logout from all devices)
     */
    async blacklistAllUserTokens(
        userId: string,
        _reason: string = 'logout_all'
    ): Promise<void> {
        // Cette méthode nécessiterait de stocker tous les tokens actifs
        // Pour l'instant, on met à jour lastLogoutAt qui invalidera tous les anciens tokens
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                lastLogoutAt: new Date()
            }
        });
    }

    /**
     * Clean up expired tokens from blacklist
     * Keeps tokens for 30 days after expiration for audit purposes
     */
    async cleanupExpiredTokens(): Promise<number> {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const result = await this.prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: thirtyDaysAgo // Delete tokens that expired more than 30 days ago
                }
            }
        });

        return result.count;
    }

    /**
     * 🧪 TEST METHOD - Clean up ALL expired tokens immediately (no 30-day grace period)
     * ⚠️ Use ONLY for testing purposes!
     */
    async testCleanupAllExpiredTokens(): Promise<number> {
        const now = new Date();
        
        const result = await this.prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: now // Delete ALL expired tokens immediately
                }
            }
        });

        return result.count;
    }

    /**
     * Get blacklist statistics
     */
    async getBlacklistStats(): Promise<{
        total: number;
        expired: number;
        active: number;
    }> {
        const now = new Date();

        const [total, expired] = await Promise.all([
            this.prisma.tokenBlacklist.count(),
            this.prisma.tokenBlacklist.count({
                where: {
                    expiresAt: { lt: now }
                }
            })
        ]);

        return {
            total,
            expired,
            active: total - expired
        };
    }

    /**
     * Get blacklist history for audit purposes
     * Returns tokens blacklisted in the last N days
     */
    async getBlacklistHistory(days: number = 7): Promise<Array<{
        tokenHash: string;
        userId?: string;
        reason: string;
        blacklistedAt: Date;
        expiresAt: Date;
        status: 'active' | 'expired';
    }>> {
        const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const now = new Date();

        const tokens = await this.prisma.tokenBlacklist.findMany({
            where: {
                blacklistedAt: {
                    gte: daysAgo
                }
            },
            select: {
                tokenHash: true,
                userId: true,
                reason: true,
                blacklistedAt: true,
                expiresAt: true
            },
            orderBy: {
                blacklistedAt: 'desc'
            }
        });

        return tokens.map(token => ({
            ...token,
            status: token.expiresAt > now ? 'active' : 'expired' as const
        }));
    }

    /**
     * Count blacklisted tokens by user
     */
    async getBlacklistStatsByUser(userId: string): Promise<{
        total: number;
        active: number;
        expired: number;
        reasons: Record<string, number>;
    }> {
        const now = new Date();

        const [total, active, reasonStats] = await Promise.all([
            this.prisma.tokenBlacklist.count({
                where: { userId }
            }),
            this.prisma.tokenBlacklist.count({
                where: { 
                    userId,
                    expiresAt: { gt: now }
                }
            }),
            this.prisma.tokenBlacklist.groupBy({
                by: ['reason'],
                where: { userId },
                _count: { reason: true }
            })
        ]);

        const reasons = reasonStats.reduce((acc, stat) => {
            acc[stat.reason] = stat._count.reason;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            active,
            expired: total - active,
            reasons
        };
    }
}
