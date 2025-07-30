import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostMediaType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostMediaFileService {
    private readonly uploadDir: string;
    private readonly postMediaDir: string;
    private readonly imagesDir: string;
    private readonly videosDir: string;

    constructor(private readonly configService: ConfigService) {
        // Configuration des dossiers depuis les variables d'environnement
        this.uploadDir = path.join(
            process.cwd(),
            this.configService.get<string>('UPLOAD_DIRECTORY', 'uploads')
        );
        this.postMediaDir = path.join(this.uploadDir, 'postMedia');
        this.imagesDir = path.join(this.postMediaDir, 'images');
        this.videosDir = path.join(this.postMediaDir, 'videos');

        this.ensureDirectories();
    }

    private ensureDirectories() {
        // Créer les dossiers s'ils n'existent pas
        [this.uploadDir, this.postMediaDir, this.imagesDir, this.videosDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    async uploadFile(
        file: Express.Multer.File,
        mediaType: PostMediaType
    ): Promise<{ mediaUrl: string; filename: string }> {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Validation de la taille (10MB max pour vidéos, 5MB pour images)
        const maxSize = mediaType === PostMediaType.VIDEO ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException(
                `File too large. Max size: ${maxSize / (1024 * 1024)}MB for ${mediaType.toLowerCase()}s`
            );
        }

        // Validation du type MIME
        this.validateMimeType(file, mediaType);

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${this.sanitizeFilename(file.originalname)}`;

        // Déterminer le dossier de destination
        const targetDir = mediaType === PostMediaType.IMAGE ? this.imagesDir : this.videosDir;
        const filePath = path.join(targetDir, uniqueFilename);

        try {
            // Écrire le fichier sur le disque
            fs.writeFileSync(filePath, file.buffer);

            // Retourner l'URL relative pour l'API
            const mediaUrl = `/uploads/postMedia/${mediaType.toLowerCase()}s/${uniqueFilename}`;

            return {
                mediaUrl,
                filename: uniqueFilename
            };
        } catch (error) {
            throw new BadRequestException(`Failed to save file: ${error.message}`);
        }
    }

    private validateMimeType(file: Express.Multer.File, mediaType: PostMediaType) {
        const allowedImageTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];

        const allowedVideoTypes = [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo', // .avi
            'video/webm'
        ];

        if (mediaType === PostMediaType.IMAGE && !allowedImageTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid image type. Allowed: ${allowedImageTypes.join(', ')}`
            );
        }

        if (mediaType === PostMediaType.VIDEO && !allowedVideoTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Invalid video type. Allowed: ${allowedVideoTypes.join(', ')}`
            );
        }
    }

    private sanitizeFilename(filename: string): string {
        // Supprimer les caractères dangereux du nom de fichier
        return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    }

    async deleteFile(mediaUrl: string): Promise<void> {
        try {
            // Convertir l'URL en chemin de fichier local
            const relativePath = mediaUrl.replace('/uploads/', '');
            const filePath = path.join(this.uploadDir, relativePath);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            // Logger l'erreur mais ne pas faire échouer l'opération
            console.error(`Failed to delete file ${mediaUrl}:`, error);
        }
    }

    getFileStats(mediaUrl: string): { exists: boolean; size?: number; mtime?: Date } {
        try {
            const relativePath = mediaUrl.replace('/uploads/', '');
            const filePath = path.join(this.uploadDir, relativePath);

            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                return {
                    exists: true,
                    size: stats.size,
                    mtime: stats.mtime
                };
            }
        } catch (error) {
            console.error(`Failed to get file stats for ${mediaUrl}:`, error);
        }

        return { exists: false };
    }
}
