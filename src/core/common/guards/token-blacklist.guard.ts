import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { TokenBlacklistService } from '../../services/token-blacklist.service';
import { PrismaService } from '../../services/prisma.service';

@Injectable()
export class TokenBlacklistGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly tokenBlacklistService: TokenBlacklistService,
        private readonly prismaService: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Access token is required');
        }

        try {
            const JWT_SECRET = this.configService.get('JWT_SECRET', 'secret');

            // 1. Vérification JWT standard
            const payload = await this.jwtService.verifyAsync(token, {
                secret: JWT_SECRET
            });

            // 2. Vérification blacklist
            const isBlacklisted =
                await this.tokenBlacklistService.isTokenBlacklisted(token);
            if (isBlacklisted) {
                throw new UnauthorizedException('Token has been revoked');
            }

            // 3. Vérification lastLogoutAt
            const user = await this.prismaService.user.findUnique({
                where: { id: payload.sub },
                select: { lastLogoutAt: true }
            });

            if (user?.lastLogoutAt) {
                const tokenIssuedAt = new Date(payload.iat * 1000);
                if (tokenIssuedAt <= user.lastLogoutAt) {
                    throw new UnauthorizedException(
                        'Token was issued before last logout'
                    );
                }
            }

            // 4. Ajout des données utilisateur à la requête
            request['user'] = payload;
            request['token'] = token;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid or expired token');
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
