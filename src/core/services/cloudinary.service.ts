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
     * Extrait le public_id d'une URL Cloudinary
     */
    extractPublicIdFromUrl(cloudinaryUrl: string): string | null {
        try {
            // URL format: https://res.cloudinary.com/dmznx6gsj/image/upload/v1234567890/profile-images/user-123-1234567890.webp
            const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/i);
            return matches ? matches[1] : null;
        } catch (error) {
            console.error('Error extracting public_id:', error);
            return null;
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