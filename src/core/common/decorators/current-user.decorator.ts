import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur pour extraire les données utilisateur de la requête
 * Utilisé après TokenBlacklistGuard
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    }
);

/**
 * Décorateur pour extraire le token de la requête
 * Utilisé après TokenBlacklistGuard
 */
export const CurrentToken = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.token;
    }
);
