import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor(private readonly configService: ConfigService) {
        // Configuration Cloudinary
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME', 'dmznx6gsj'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY', '464166417664749'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET', 'MqUPWBd26KRNx6nb_1VdUOBn0XI'),
        });
    }

    /**
     * Upload une image de profil vers Cloudinary
     */
    async uploadProfileImage(
        file: Express.Multer.File, 
        userId: string
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: 'profile-images', // Dossier dans Cloudinary
                public_id: `user-${userId}-${Date.now()}`, // ID unique
                resource_type: 'image' as const,
                transformation: [
                    {
                        width: 400,
                        height: 400,
                        crop: 'fill',
                        gravity: 'face', // Focus sur le visage si détecté
                        quality: 'auto:good',
                        format: 'webp' // Format optimisé
                    }
                ],
                overwrite: true, // Écraser si existe déjà
                invalidate: true, // Invalider le cache CDN
                eager: [
                    {
                        width: 150,
                        height: 150,
                        crop: 'fill',
                        gravity: 'face',
                        format: 'webp'
                    }
                ], // Générer une version thumbnail
                eager_async: false, // Générer immédiatement
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('❌ Cloudinary Upload Error:', error);
                        reject(error);
                    } else if (result) {
                        console.log('✅ Cloudinary Upload Success:', result.secure_url);
                        resolve(result);
                    } else {
                        reject(new Error('Unexpected error during upload'));
                    }
                }
            ).end(file.buffer);
        });
    }

    /**
     * Supprime une image de profil de Cloudinary
     */
    async deleteProfileImage(publicId: string): Promise<any> {
        try {
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: 'image'
            });
            console.log('🗑️ Cloudinary Delete Result:', result);
            return result;
        } catch (error) {
            console.error('❌ Cloudinary Delete Error:', error);
            throw error;
        }
    }



    /**
     * Génère l'URL avec transformations personnalisées
     */
    getOptimizedUrl(publicId: string, width: number = 400, height: number = 400): string {
        return cloudinary.url(publicId, {
            width,
            height,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto:good',
            format: 'webp',
            secure: true
        });
    }

    /**
     * Upload un logo de projet vers Cloudinary
     */
    async uploadProjectLogo(
        file: Express.Multer.File, 
        projectId: string
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: 'projects/logos',
                public_id: `project-${projectId}-logo-${Date.now()}`,
                resource_type: 'image' as const,
                transformation: [
                    {
                        width: 300,
                        height: 300,
                        crop: 'fill',
                        quality: 'auto:good',
                        format: 'webp'
                    }
                ],
                overwrite: true,
                invalidate: true,
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('❌ Cloudinary Project Logo Upload Error:', error);
                        reject(error);
                    } else if (result) {
                        console.log('✅ Cloudinary Project Logo Upload Success:', result.secure_url);
                        resolve(result);
                    } else {
                        reject(new Error('Unexpected error during project logo upload'));
                    }
                }
            ).end(file.buffer);
        });
    }

    /**
     * Upload un document/fichier vers Cloudinary
     */
    async uploadDocument(
        file: Express.Multer.File, 
        projectId: string,
        userId: string
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            // Extraire l'extension du fichier original de manière robuste
            const originalName = file.originalname;
            const lastDotIndex = originalName.lastIndexOf('.');
            const fileExtension = lastDotIndex !== -1 
                ? originalName.substring(lastDotIndex + 1).toLowerCase()
                : 'pdf'; // Extension par défaut
            
            // Logique adaptée pour les comptes untrusted :
            // - Images (PNG, JPG) et PDF → resource_type: 'image' (accessible)
            // - PPT/PPTX → resource_type: 'raw' avec flags spéciaux (obligatoire car ZIP)
            const isPptFile = ['ppt', 'pptx'].includes(fileExtension);
            const resourceType = isPptFile ? 'raw' : 'image';
            
            // Valider que l'extension est supportée
            const supportedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'ppt', 'pptx'];
            const validExtension = supportedExtensions.includes(fileExtension) ? fileExtension : 'pdf';
            
            console.log(`📄 Upload document: ${originalName} → Extension: ${validExtension}, ResourceType: ${resourceType}`);
            
            const uploadOptions: any = {
                folder: 'projects/documents',
                public_id: isPptFile 
                    ? `project-${projectId}-doc-${userId}-${Date.now()}.${validExtension}` // Raw avec extension
                    : `project-${projectId}-doc-${userId}-${Date.now()}`, // Image sans extension
                resource_type: resourceType,
                overwrite: true,
                invalidate: true,
            };

            // Pour les fichiers PPT sur compte untrusted, ajouter des flags spéciaux
            if (isPptFile) {
                uploadOptions.flags = 'attachment'; // Force le téléchargement au lieu de l'affichage direct
                uploadOptions.access_mode = 'public'; // Assurer l'accès public
            }

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('❌ Cloudinary Document Upload Error:', error);
                        reject(error);
                    } else if (result) {
                        console.log('✅ Cloudinary Document Upload Success:', result.secure_url);
                        resolve(result);
                    } else {
                        reject(new Error('Unexpected error during document upload'));
                    }
                }
            ).end(file.buffer);
        });
    }

    /**
     * Upload une vidéo vers Cloudinary
     */
    async uploadVideo(
        file: Express.Multer.File, 
        projectId: string,
        userId: string
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: 'projects/videos',
                public_id: `project-${projectId}-video-${userId}-${Date.now()}`,
                resource_type: 'video' as const,
                transformation: [
                    {
                        quality: 'auto:good',
                        format: 'mp4',
                        video_codec: 'h264'
                    }
                ],
                overwrite: true,
                invalidate: true,
                eager: [
                    {
                        width: 640,
                        height: 360,
                        crop: 'pad',
                        quality: 'auto:low',
                        format: 'mp4'
                    }
                ],
                eager_async: false,
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('❌ Cloudinary Video Upload Error:', error);
                        reject(error);
                    } else if (result) {
                        console.log('✅ Cloudinary Video Upload Success:', result.secure_url);
                        resolve(result);
                    } else {
                        reject(new Error('Unexpected error during video upload'));
                    }
                }
            ).end(file.buffer);
        });
    }

    /**
     * Upload une image de post vers Cloudinary
     */
    async uploadPostImage(
        file: Express.Multer.File, 
        postId: string,
        userId: string
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadOptions = {
                folder: 'posts/images',
                public_id: `post-${postId}-img-${userId}-${Date.now()}`,
                resource_type: 'image' as const,
                transformation: [
                    {
                        width: 800,
                        height: 600,
                        crop: 'limit', // Ne pas recadrer, juste limiter la taille
                        quality: 'auto:good',
                        format: 'webp'
                    }
                ],
                overwrite: true,
                invalidate: true,
                eager: [
                    {
                        width: 400,
                        height: 300,
                        crop: 'fill',
                        quality: 'auto:low',
                        format: 'webp'
                    }
                ],
                eager_async: false,
            };

            cloudinary.uploader.upload_stream(
                uploadOptions,
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) {
                        console.error('❌ Cloudinary Post Image Upload Error:', error);
                        reject(error);
                    } else if (result) {
                        console.log('✅ Cloudinary Post Image Upload Success:', result.secure_url);
                        resolve(result);
                    } else {
                        reject(new Error('Unexpected error during post image upload'));
                    }
                }
            ).end(file.buffer);
        });
    }

    /**
     * Supprime un fichier de Cloudinary (générique)
     */
    async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<any> {
        try {
            console.log(`🗑️ Tentative de suppression Cloudinary:`, { publicId, resourceType });
            const result = await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType
            });
            console.log('🗑️ Cloudinary Delete Result:', result);
            return result;
        } catch (error) {
            console.error('❌ Cloudinary Delete Error:', error);
            throw error;
        }
    }

    /**
     * Extrait le public_id d'une URL Cloudinary (version étendue)
     */
    extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
        try {
            // URL format: https://res.cloudinary.com/dmznx6gsj/image/upload/v1234567890/folder/file
            // ou: https://res.cloudinary.com/dmznx6gsj/video/upload/v1234567890/folder/file.mp4
            // Tous les documents sont maintenant stockés comme 'image' pour éviter 'untrusted'
            const matches = cloudinaryUrl.match(/\/(?:image|video|raw)\/upload\/v\d+\/(.+)$/i);
            if (matches) {
                const pathWithExtension = matches[1];
                
                // Pour les types image et video, enlever l'extension du publicId
                // Pour raw (anciens fichiers), garder l'extension
                const isRawFile = cloudinaryUrl.includes('/raw/upload/');
                const publicId = isRawFile ? pathWithExtension : pathWithExtension.replace(/\.[^/.]+$/, '');
                
                console.log('🔍 Public ID extrait:', { publicId, isRawFile, url: cloudinaryUrl });
                return publicId;
            }
            return null;
        } catch (error) {
            console.error('Error extracting public_id:', error);
            return null;
        }
    }

    /**
     * Teste la connexion à Cloudinary
     */
    async testConnection(): Promise<any> {
        try {
            const result = await cloudinary.api.ping();
            console.log('🌥️ Cloudinary Connection Test:', result);
            return { connected: true, result };
        } catch (error) {
            console.error('❌ Cloudinary Connection Error:', error);
            return { connected: false, error: error.message };
        }
    }
}