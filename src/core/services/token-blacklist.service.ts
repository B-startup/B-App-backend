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
     */
    async isTokenBlacklisted(token: string): Promise<boolean> {
        const tokenHash = this.hashToken(token);

        const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
            where: { tokenHash }
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
     */
    async cleanupExpiredTokens(): Promise<number> {
        const result = await this.prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
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
}
