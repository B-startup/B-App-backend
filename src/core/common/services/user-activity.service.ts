import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserActivityService {
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Enregistre le temps passé par un utilisateur dans l'application
     * @param userId - ID de l'utilisateur
     * @param timeSpentInMinutes - Temps passé en minutes
     */
    async recordTimeSpent(userId: string, timeSpentInMinutes: number): Promise<void> {
        if (timeSpentInMinutes <= 0) {
            return;
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                timeSpent: {
                    increment: timeSpentInMinutes
                }
            }
        });
    }

    /**
     * Enregistre le temps passé par un utilisateur dans l'application (en secondes)
     * @param userId - ID de l'utilisateur
     * @param timeSpentInSeconds - Temps passé en secondes
     */
    async recordTimeSpentInSeconds(userId: string, timeSpentInSeconds: number): Promise<void> {
        if (timeSpentInSeconds <= 0) {
            return;
        }

        // Convertir les secondes en minutes
        const minutes = Math.round(timeSpentInSeconds / 60);
        if (minutes > 0) {
            await this.recordTimeSpent(userId, minutes);
        }
    }

    /**
     * Obtient les statistiques de temps passé pour un utilisateur
     */
    async getUserTimeStats(userId: string): Promise<{
        totalTimeSpent: number;
        averageSessionTime: number;
        totalSessions: number;
    }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { timeSpent: true }
        });

        // Pour les sessions, on peut utiliser les vues comme approximation
        const totalSessions = await this.prisma.view.count({
            where: { userId }
        });

        const totalTimeSpent = user?.timeSpent || 0;
        const averageSessionTime = totalSessions > 0 ? totalTimeSpent / totalSessions : 0;

        return {
            totalTimeSpent,
            averageSessionTime,
            totalSessions
        };
    }

    /**
     * Obtient le temps moyen passé par tous les utilisateurs
     */
    async getGlobalTimeStats(): Promise<{
        averageTimeSpent: number;
        totalUsers: number;
        mostActiveUsers: Array<{
            userId: string;
            name: string;
            timeSpent: number;
        }>;
    }> {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                timeSpent: true
            },
            where: {
                timeSpent: {
                    gt: 0
                }
            }
        });

        const totalTimeSpent = users.reduce((sum, user) => sum + (user.timeSpent || 0), 0);
        const totalUsers = users.length;
        const averageTimeSpent = totalUsers > 0 ? totalTimeSpent / totalUsers : 0;

        // Top 10 utilisateurs les plus actifs
        const mostActiveUsers = users
            .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
            .slice(0, 10)
            .map(user => ({
                userId: user.id,
                name: user.name,
                timeSpent: user.timeSpent || 0
            }));

        return {
            averageTimeSpent,
            totalUsers,
            mostActiveUsers
        };
    }

    /**
     * Remet à zéro le temps passé pour un utilisateur (utile pour les tests ou la maintenance)
     */
    async resetUserTimeSpent(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                timeSpent: 0
            }
        });
    }

    /**
     * Enregistre une session utilisateur avec durée automatique
     * @param userId - ID de l'utilisateur
     * @param sessionStartTime - Timestamp de début de session
     * @param sessionEndTime - Timestamp de fin de session (optionnel, par défaut maintenant)
     */
    async recordSession(
        userId: string, 
        sessionStartTime: Date, 
        sessionEndTime: Date = new Date()
    ): Promise<void> {
        const sessionDurationMs = sessionEndTime.getTime() - sessionStartTime.getTime();
        const sessionDurationMinutes = Math.round(sessionDurationMs / (1000 * 60));

        if (sessionDurationMinutes > 0) {
            await this.recordTimeSpent(userId, sessionDurationMinutes);
        }
    }
}
