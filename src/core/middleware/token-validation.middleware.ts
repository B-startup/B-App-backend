import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class TokenValidationMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        // Extraire le token de l'en-tête Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // Pas de token, laisser les guards s'en occuper
        }

        const token = authHeader.substring(7); // Enlever "Bearer "

        try {
            // Vérifier si le token est blacklisté
            const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(token);
            
            if (isBlacklisted) {
                throw new UnauthorizedException('Token has been revoked');
            }

            // Décoder le token pour obtenir l'userId
            const decoded = this.jwtService.decode(token);
            if (decoded && typeof decoded === 'object' && 'id' in decoded) {
                // Vérifier avec lastLogoutAt
                const isValid = await this.isTokenValidByTimestamp(token, decoded.id);
                if (!isValid) {
                    throw new UnauthorizedException('Token is no longer valid');
                }
            }

            next();
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            // Pour d'autres erreurs, laisser passer et laisser les guards gérer
            next();
        }
    }

    private async isTokenValidByTimestamp(token: string, userId: string): Promise<boolean> {
        try {
            const decoded = this.jwtService.decode(token);
            const tokenIssuedAt = decoded && typeof decoded === 'object' && 'iat' in decoded 
                ? new Date(decoded.iat * 1000) 
                : null;

            if (!tokenIssuedAt) {
                return false;
            }

            // Cette partie nécessiterait l'accès à PrismaService
            // Pour simplifier, on retourne true ici et on laisse la validation dans AuthService
            return true;
        } catch {
            return false;
        }
    }
}
