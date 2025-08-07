import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    NotFoundException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../services/prisma.service';

/**
 * Guard pour vérifier que l'utilisateur connecté est le propriétaire de la ressource
 * Utilisé pour protéger les opérations UPDATE et DELETE
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const resourceId = request.params.id;

        // Déterminer le type de ressource depuis les métadonnées
        const resourceType = this.reflector.get<string>(
            'resourceType',
            context.getHandler()
        );

        if (!resourceType) {
            // Si pas de métadonnées, on laisse passer (garde optionnel)
            return true;
        }

        if (!user || !resourceId) {
            throw new ForbiddenException('User or resource ID not found');
        }

        const isOwner = await this.checkResourceOwnership(
            resourceType,
            resourceId,
            user.sub // Standard JWT subject
        );

        if (!isOwner) {
            throw new ForbiddenException(
                `You are not the owner of this ${resourceType}`
            );
        }

        return true;
    }

    private async checkResourceOwnership(
        resourceType: string,
        resourceId: string,
        userId: string
    ): Promise<boolean> {
        try {
            switch (resourceType) {
                case 'comment': {
                    const comment = await this.prismaService.comment.findUnique(
                        {
                            where: { id: resourceId },
                            select: { userId: true }
                        }
                    );
                    if (!comment)
                        throw new NotFoundException('Comment not found');
                    return comment.userId === userId;
                }

                case 'post': {
                    const post = await this.prismaService.post.findUnique({
                        where: { id: resourceId },
                        select: { userId: true }
                    });
                    if (!post) throw new NotFoundException('Post not found');
                    return post.userId === userId;
                }

                case 'project': {
                    const project = await this.prismaService.project.findUnique(
                        {
                            where: { id: resourceId },
                            select: { creatorId: true }
                        }
                    );
                    if (!project)
                        throw new NotFoundException('Project not found');
                    return project.creatorId === userId;
                }

                default:
                    throw new Error(
                        `Resource type '${resourceType}' not supported`
                    );
            }
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof ForbiddenException
            ) {
                throw error;
            }
            // Log l'erreur et rejeter pour sécurité
            console.error('Error checking resource ownership:', error);
            return false;
        }
    }
}
