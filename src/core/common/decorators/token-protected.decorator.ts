import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TokenBlacklistGuard } from '../guards/token-blacklist.guard';

/**
 * Décorateur pour protéger les endpoints avec vérification de blacklist
 * Combine l'authentification JWT et la vérification de révocation des tokens
 */
export function TokenProtected() {
    return applyDecorators(
        UseGuards(TokenBlacklistGuard),
        ApiBearerAuth(),
        ApiResponse({
            status: 401,
            description: 'Token manquant, invalide, expiré ou révoqué',
            schema: {
                type: 'object',
                properties: {
                    statusCode: { type: 'number', example: 401 },
                    message: { 
                        type: 'string', 
                        examples: [
                            'Access token is required',
                            'Token has been revoked or invalidated',
                            'Invalid or expired token'
                        ]
                    },
                    error: { type: 'string', example: 'Unauthorized' }
                }
            }
        })
    );
}
