import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto';
import {  User } from '@prisma/client';
import { cryptPassword, handleOtpOperation } from '../../../core/utils/auth';
import {
    EmailSubject,
    EmailTemplate
} from 'src/core/constants/email.constants';
@Injectable()
export class UserService extends BaseCrudServiceImpl<User, CreateUserDto, UpdateUserDto> {
    protected model: any;
    private readonly profileImagesDir: string;
    private readonly maxFileSize: number;
    private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    constructor(
        prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) {
        super(prisma);
        this.model = prisma.user;
        this.profileImagesDir = path.join(
            process.cwd(),
            this.configService.get<string>('PROFILE_IMAGES_DIR', 'uploads/profile-images')
        );
        this.maxFileSize = parseInt(this.configService.get<string>('PROFILE_IMAGES_MAX_SIZE', '2097152'));
        this.ensureUploadDirectoryExists();
    }

    async create(createDto: CreateUserDto): Promise<User> {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createDto.email }
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Préparer les données à insérer
        const userData: any = {
            ...createDto,
            password: await cryptPassword(createDto.password),
            isEmailVerified: false
        };

        const user = await this.prisma.user.create({
            data: userData
        });

        // Generate and send OTP for verification
        await handleOtpOperation(
            this.prisma,
            this.mailerService,
            createDto.email,
            {
                template: EmailTemplate.VERIFY_ACCOUNT,
                subject: EmailSubject.VERIFY_ACCOUNT
            }
        );
        
        return user;
    }

    // Méthodes spécifiques qui retournent des DTOs (pour le controller)
    
    /**
     * Créer un utilisateur et retourner le DTO
     */
    async createUser(createDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.create(createDto);
        return this.toUserResponseDto(user);
    }

    /**
     * Trouver tous les utilisateurs et retourner les DTOs
     */
    async findAllUsers(): Promise<UserResponseDto[]> {
        const users = await this.findAll();
        return users.map(user => this.toUserResponseDto(user));
    }

    /**
     * Trouver un utilisateur et retourner le DTO
     */
    async findUserById(id: string): Promise<UserResponseDto> {
        const user = await this.findOne(id);
        return this.toUserResponseDto(user);
    }

    /**
     * Obtenir un utilisateur avec ses statistiques détaillées (directement depuis la DB)
     */
    async findOneWithStats(id: string): Promise<UserResponseDto> {
        const user = await this.model.findUnique({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }

        return this.toUserResponseDto(user);
    }

    /**
     * Obtenir tous les utilisateurs avec leurs statistiques (directement depuis la DB)
     */
    async findAllWithStats(): Promise<UserResponseDto[]> {
        const users = await this.model.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return users.map(user => this.toUserResponseDto(user));
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        // Filtrer les champs vides/undefined/null pour ne mettre à jour que les champs fournis
        const updateData = Object.keys(updateUserDto).reduce((acc, key) => {
            const value = updateUserDto[key];
            if (value !== undefined && value !== null) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        // Si aucune donnée à mettre à jour, retourner l'utilisateur existant
        if (Object.keys(updateData).length === 0) {
            return await this.findOne(id);
        }

        // Si le mot de passe est fourni, le hasher
        if (updateData.password) {
            updateData.password = await cryptPassword(updateData.password);
        }

        // Convertir la date de naissance en objet Date si fournie
        if (updateData.birthdate) {
            updateData.birthdate = new Date(updateData.birthdate) as any;
        }

        // Si l'email est modifié, vérifier l'unicité
        if (updateData.email) {
            const existingEmailUser = await this.model.findFirst({
                where: { 
                    email: updateData.email,
                    id: { not: id }
                }
            });
            if (existingEmailUser) {
                throw new ConflictException('Un utilisateur avec cet email existe déjà');
            }
        }

        return await this.model.update({
            where: { id },
            data: updateData
        });
    }

    async remove(id: string): Promise<User> {
        const user = await this.findOne(id);
        
        // Supprimer l'image de profil si elle existe
        if (user.profilePicture) {
            await this.deleteProfileImageFile(user.profilePicture);
        }

        return await this.model.delete({
            where: { id }
        });
    }

    /**
     * Supprimer un utilisateur et retourner le DTO
     */
    async removeUser(id: string): Promise<UserResponseDto> {
        const user = await this.remove(id);
        return this.toUserResponseDto(user);
    }

    // Méthodes spécifiques à User

    /**
     * Recherche avancée - cherche dans plusieurs champs avec une seule query (statistiques déjà en DB)
     */
    async advancedSearch(filters: {
        searchQuery?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
    }> {
        const { searchQuery, page = 1, limit = 10 } = filters;
        
        const where: any = {};
        
        if (searchQuery?.trim()) {
            where.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { email: { contains: searchQuery, mode: 'insensitive' } },
                { country: { contains: searchQuery, mode: 'insensitive' } },
                { city: { contains: searchQuery, mode: 'insensitive' } },
                { webSite: { contains: searchQuery, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            this.model.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.model.count({ where })
        ]);

        return {
            users: users.map(user => this.toUserResponseDto(user)),
            total,
            page,
            limit
        };
    }




    

    async getUserStats(): Promise<{
        total: number;
        verified: number;
        unverified: number;
        byRole: Record<string, number>;
        byCountry: Record<string, number>;
    }> {
        const [
            total,
            verified,
            roleStats,
            countryStats
        ] = await Promise.all([
            this.model.count(),
            this.model.count({ where: { isEmailVerified: true } }),
            this.model.groupBy({
                by: ['role'],
                _count: { role: true }
            }),
            this.model.groupBy({
                by: ['country'],
                _count: { country: true },
                where: { country: { not: null } }
            })
        ]);

        return {
            total,
            verified,
            unverified: total - verified,
            byRole: roleStats.reduce((acc, item) => {
                acc[item.role] = item._count.role;
                return acc;
            }, {}),
            byCountry: countryStats.reduce((acc, item) => {
                acc[item.country] = item._count.country;
                return acc;
            }, {})
        };
    }

    // Méthodes de gestion des images de profil

    async uploadProfileImage(userId: string, file: Express.Multer.File): Promise<UserResponseDto> {
        if (!file) {
            throw new BadRequestException('Aucun fichier fourni');
        }

        this.validateImageFile(file);

        const user = await this.findOne(userId);
        const oldImagePath = user.profilePicture;

        console.log('🔄 Upload d\'une nouvelle image de profil pour l\'utilisateur:', userId);
        console.log('📁 Ancienne image:', oldImagePath || 'Aucune');

        // Supprimer l'ancienne image avant d'uploader la nouvelle
        if (oldImagePath) {
            console.log('🗑️  Suppression de l\'ancienne image...');
            await this.deleteProfileImageFile(oldImagePath);
        }

        // Générer un nom de fichier unique
        const fileExtension = path.extname(file.originalname);
        const filename = `profile-${Date.now()}-${uuidv4().slice(0, 6)}${fileExtension}`;
        const relativePath = `profile-images/${filename}`;
        const fullPath = path.join(this.profileImagesDir, filename);

        console.log('📤 Nouveau fichier à sauvegarder:', fullPath);

        try {
            // Sauvegarder le fichier
            fs.writeFileSync(fullPath, file.buffer);
            console.log('✅ Fichier sauvegardé avec succès');

            // Mettre à jour l'utilisateur
            const updatedUser = await this.model.update({
                where: { id: userId },
                data: { profilePicture: relativePath }
            });

            console.log('✅ Base de données mise à jour avec le nouveau chemin:', relativePath);
            return this.toUserResponseDto(updatedUser);
        } catch (error) {
            console.error('❌ Erreur lors de l\'upload de l\'image:', error);
            // Si l'upload échoue, on ne peut pas restaurer l'ancienne image car elle a été supprimée
            throw new BadRequestException('Erreur lors de l\'upload de l\'image');
        }
    }

    async updateWithProfileImage(id: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File): Promise<UserResponseDto> {
        // Effectuer la mise à jour des données utilisateur d'abord
        let updatedUser;
        if (Object.keys(updateUserDto).length > 0) {
            updatedUser = await this.update(id, updateUserDto);
        } else {
            updatedUser = await this.findOne(id);
        }
        
        // Si une nouvelle image est fournie, la traiter
        if (file) {
            // uploadProfileImage s'occupera de supprimer l'ancienne image et retourne un UserResponseDto
            return this.uploadProfileImage(id, file);
        }
        
        // Retourner le DTO même si aucune image n'est fournie
        return this.toUserResponseDto(updatedUser);
    }

    async removeProfileImage(userId: string): Promise<UserResponseDto> {
        const user = await this.findOne(userId);
        
        console.log('🗑️  Suppression de l\'image de profil pour l\'utilisateur:', userId);
        console.log('📁 Image à supprimer:', user.profilePicture || 'Aucune');
        
        if (user.profilePicture) {
            await this.deleteProfileImageFile(user.profilePicture);
            
            const updatedUser = await this.model.update({
                where: { id: userId },
                data: { profilePicture: null }
            });
            
            console.log('✅ Image de profil supprimée et base de données mise à jour');
            return this.toUserResponseDto(updatedUser);
        }
        
        console.log('ℹ️  Aucune image de profil à supprimer');
        return user;
    }

    // Méthodes utilitaires privées

    private toUserResponseDto(user: any): UserResponseDto {
        const { password, otpCode, otpCodeExpiresAt, refreshToken, ...userWithoutSensitiveInfo } = user;
        
        // S'assurer que les champs statistiques sont présents avec des valeurs par défaut
        return {
            ...userWithoutSensitiveInfo,
            profilePicture: this.buildProfileImageUrl(user.profilePicture),
            nbPosts: user.nbPosts || 0,
            nbProjects: user.nbProjects || 0,
            nbOffer: user.nbOffer || 0,
            nbConnects: user.nbConnects || 0,
            nbFollowers: user.nbFollowers || 0,
            nbFollowing: user.nbFollowing || 0,
            nbVisits: user.nbVisits || 0,
            timeSpent: user.timeSpent || 0,
            score: user.score || 0
        };
    }

    /**
     * Construit l'URL complète pour accéder à une image de profil
     */
    private buildProfileImageUrl(profilePicturePath: string): string | null {
        if (!profilePicturePath) {
            return null;
        }

        const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:8050/');
        // S'assurer que baseUrl se termine par "/"
        const formattedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        
        if (profilePicturePath.startsWith('profile-images/')) {
            // Pour les chemins relatifs "profile-images/filename.jpg"
            return `${formattedBaseUrl}uploads/${profilePicturePath}`;
        } else if (profilePicturePath.startsWith('uploads/')) {
            // Pour les chemins qui commencent déjà par "uploads/"
            return `${formattedBaseUrl}${profilePicturePath}`;
        } else {
            // Pour les autres cas, ajouter le préfixe complet
            return `${formattedBaseUrl}uploads/profile-images/${profilePicturePath}`;
        }
    }

    private validateImageFile(file: Express.Multer.File): void {
        if (!this.allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Type de fichier non supporté. Seuls JPEG, PNG, GIF et WebP sont acceptés.');
        }

        if (file.size > this.maxFileSize) {
            throw new BadRequestException(`Fichier trop volumineux. Taille maximale: ${this.maxFileSize / 1024 / 1024}MB`);
        }
    }

    private ensureUploadDirectoryExists(): void {
        if (!fs.existsSync(this.profileImagesDir)) {
            fs.mkdirSync(this.profileImagesDir, { recursive: true });
        }
    }

    private async deleteProfileImageFile(imagePath: string): Promise<void> {
        if (!imagePath) {
            console.warn('Aucun chemin d\'image fourni pour la suppression');
            return;
        }

        try {
            let fullPath: string;
            
            // Gérer différents formats de chemin stockés en base
            if (imagePath.startsWith('uploads/')) {
                // Si le chemin commence par "uploads/", utiliser tel quel
                fullPath = path.resolve(process.cwd(), imagePath);
            } else if (imagePath.startsWith('profile-images/')) {
                // Si le chemin commence par "profile-images/", ajouter "uploads/"
                fullPath = path.resolve(process.cwd(), 'uploads', imagePath);
            } else {
                // Pour les autres cas, essayer d'abord avec uploads/profile-images/
                const filename = path.basename(imagePath);
                fullPath = path.resolve(process.cwd(), 'uploads', 'profile-images', filename);
            }
            
            console.log('🗑️  Tentative de suppression du fichier:', fullPath);
            
            // Vérifier si le fichier existe avant de le supprimer
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log('✅ Image de profil supprimée avec succès:', imagePath);
            } else {
                console.warn('⚠️  Le fichier à supprimer n\'existe pas:', fullPath);
                
                // Tentative avec d'autres chemins possibles
                const alternatives = [
                    path.resolve(process.cwd(), imagePath), // Chemin direct
                    path.resolve(process.cwd(), 'uploads', path.basename(imagePath)), // Dans uploads/
                    path.resolve(process.cwd(), path.basename(imagePath)) // Racine du projet
                ];
                
                let found = false;
                for (const altPath of alternatives) {
                    if (fs.existsSync(altPath)) {
                        console.log('✅ Fichier trouvé avec chemin alternatif:', altPath);
                        fs.unlinkSync(altPath);
                        console.log('✅ Image supprimée avec succès');
                        found = true;
                        break;
                    }
                }
                
                if (!found) {
                    console.warn('⚠️  Impossible de trouver le fichier à supprimer:', imagePath);
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'image de profil:', {
                imagePath,
                error: error.message,
                stack: error.stack
            });
            // On ne lance pas l'erreur pour ne pas bloquer le processus principal
            // mais on log l'erreur pour le débogage
        }
    }

    // ==================== HYBRID APPROACH METHODS ====================

    /**
     * Override findAll() - Hybrid approach: direct Prisma selection for simple lists
     */
    override async findAll() {
        return this.model.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePicture: true,
                nbFollowers: true,
                nbFollowing: true,
                nbProjects: true,
                nbPosts: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Override findOne() - Simple selection for base CRUD compatibility
     */
    override async findOne(id: string) {
        const user = await this.model.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profilePicture: true,
                description: true,
                phone: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Override findByUser() - Not applicable for User entity (would be circular)
     */
    override async findByUser(userId: string) {
        // For User entity, this doesn't make sense, return empty array
        return [];
    }

    /**
     * Get simple users list for dropdowns/selectors (no business logic)
     */
    async findAllSimple() {
        return this.model.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true
            },
            where: {
                role: { not: 'ADMIN' } // Exclude admins from simple lists
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Search users (simple selection for performance)
     */
    async searchUsers(query: string) {
        return this.model.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
                nbFollowers: true,
                role: true
            },
            take: 20, // Limit results for performance
            orderBy: { nbFollowers: 'desc' } // Most followed first
        });
    }
}
