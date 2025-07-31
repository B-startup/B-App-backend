import { Injectable, NotFoundException } from '@nestjs/common';
import { PostMedia, PostMediaType,PrismaClient } from '@prisma/client';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreatePostMediaDto } from './dto/create-post-media.dto';
import { UpdatePostMediaDto } from './dto/update-post-media.dto';
import { UploadPostMediaDto } from './dto/upload-post-media.dto';
import { PostMediaFileService } from './post-media-file.service';

@Injectable()
export class PostMediaService extends BaseCrudServiceImpl<
    PostMedia,
    CreatePostMediaDto,
    UpdatePostMediaDto
> {
    protected model = this.prisma.postMedia;

    constructor(
        protected readonly prisma: PrismaClient,
        private readonly postMediaFileService: PostMediaFileService
    ) {
        super(prisma);
    }

    // Méthodes CRUD héritées du BaseService :
    // - create(createPostMediaDto: CreatePostMediaDto): Promise<PostMedia>
    // - findAll(): Promise<PostMedia[]>
    // - findByUser(userId: string): Promise<PostMedia[]> [OVERRIDDEN - joins through Post]
    // - findOne(id: string): Promise<PostMedia>
    // - findOneOrFail(id: string): Promise<PostMedia>
    // - update(id: string, updatePostMediaDto: UpdatePostMediaDto): Promise<PostMedia>
    // - remove(id: string): Promise<PostMedia>

    // Méthodes personnalisées pour PostMedia

    /**
     * Override: Trouver tous les médias d'un utilisateur spécifique
     * (via la relation avec Post car PostMedia n'a pas de userId direct)
     */
    async findByUser(userId: string): Promise<PostMedia[]> {
        return await this.prisma.postMedia.findMany({
            where: { 
                post: {
                    userId: userId
                }
            },
            include: {
                post: {
                    select: {
                        id: true,
                        content: true,
                        userId: true,
                        isPublic: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Upload et créer un média pour un post
     */
    async uploadAndCreate(
        file: Express.Multer.File,
        uploadDto: UploadPostMediaDto
    ): Promise<PostMedia> {
        // Vérifier que le post existe
        const post = await this.prisma.post.findUnique({
            where: { id: uploadDto.postId }
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${uploadDto.postId} not found`);
        }

        // Upload du fichier
        const { mediaUrl } = await this.postMediaFileService.uploadFile(
            file, 
            uploadDto.mediaType
        );

        // Créer l'enregistrement en base
        const createDto: CreatePostMediaDto = {
            postId: uploadDto.postId,
            mediaUrl,
            mediaType: uploadDto.mediaType
        };

        return await this.create(createDto);
    }

    /**
     * Supprimer un média et son fichier associé
     */
    async removeWithFile(id: string): Promise<PostMedia> {
        // Récupérer le média pour obtenir l'URL du fichier
        const postMedia = await this.findOne(id);
        
        // Supprimer le fichier physique
        await this.postMediaFileService.deleteFile(postMedia.mediaUrl);

        // Supprimer l'enregistrement en base
        return await this.remove(id);
    }

    /**
     * Trouver tous les médias d'un post spécifique
     */
    async findByPost(postId: string): Promise<PostMedia[]> {
        return await this.prisma.postMedia.findMany({
            where: { postId },
            orderBy: { createdAt: 'asc' }
        });
    }

    /**
     * Trouver tous les médias par type
     */
    async findByType(mediaType: PostMediaType): Promise<PostMedia[]> {
        return await this.prisma.postMedia.findMany({
            where: { mediaType },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Trouver tous les médias d'un post par type
     */
    async findByPostAndType(postId: string, mediaType: PostMediaType): Promise<PostMedia[]> {
        return await this.prisma.postMedia.findMany({
            where: { 
                postId,
                mediaType 
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    /**
     * Compter les médias d'un post
     */
    async countByPost(postId: string): Promise<number> {
        return await this.prisma.postMedia.count({
            where: { postId }
        });
    }

    /**
     * Compter les médias par type pour un post
     */
    async countByPostAndType(postId: string, mediaType: PostMediaType): Promise<number> {
        return await this.prisma.postMedia.count({
            where: { 
                postId,
                mediaType 
            }
        });
    }

    /**
     * Trouver les médias avec les informations du post
     */
    async findAllWithPost(): Promise<any[]> {
        return await this.prisma.postMedia.findMany({
            include: {
                post: {
                    select: {
                        id: true,
                        content: true,
                        userId: true,
                        isPublic: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Vérifier l'intégrité des fichiers (utile pour la maintenance)
     */
    async checkFileIntegrity(): Promise<{
        valid: PostMedia[];
        missing: PostMedia[];
    }> {
        const allMedia = await this.findAll();
        const valid: PostMedia[] = [];
        const missing: PostMedia[] = [];

        for (const media of allMedia) {
            const fileStats = this.postMediaFileService.getFileStats(media.mediaUrl);
            if (fileStats.exists) {
                valid.push(media);
            } else {
                missing.push(media);
            }
        }

        return { valid, missing };
    }
}
