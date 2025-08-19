import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur pour extraire l'ID de l'utilisateur actuel depuis le token JWT
 * Doit être utilisé avec @TokenProtected() qui injecte les données utilisateur dans req.user
 */
export const GetCurrentUserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.id || request.user?.sub;
    },
);
