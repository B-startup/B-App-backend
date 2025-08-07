import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { TokenBlacklistGuard } from '../guards/token-blacklist.guard';
import { ResourceOwnerGuard } from '../guards/resource-owner.guard';

const RESOURCE_TYPE_KEY = 'resourceType';

/**
 * Métadonnée pour spécifier le type de ressource à vérifier
 */
export const ResourceType = (type: string) =>
    SetMetadata(RESOURCE_TYPE_KEY, type);

/**
 * Décorateur combiné pour protéger les endpoints qui nécessitent :
 * 1. Un token valide (non blacklisté)
 * 2. Que l'utilisateur soit propriétaire de la ressource
 */
export function OwnerProtected(resourceType: 'comment' | 'post' | 'project') {
    return applyDecorators(
        UseGuards(TokenBlacklistGuard, ResourceOwnerGuard),
        ResourceType(resourceType),
        ApiResponse({
            status: 401,
            description: 'Token manquant, invalide ou révoqué'
        }),
        ApiResponse({
            status: 403,
            description:
                "Accès refusé - vous n'êtes pas le propriétaire de cette ressource"
        }),
        ApiResponse({
            status: 404,
            description: 'Ressource non trouvée'
        })
    );
}
