import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseCrudServiceImpl } from '../../../core/common/services/base-crud.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import { cryptPassword, handleOtpOperation } from '../../../core/utils/auth';
import {
    EmailSubject,
    EmailTemplate
} from 'src/core/constants/email.constants';
@Injectable()
export class UserService extends BaseCrudServiceImpl<UserResponseDto, CreateUserDto, UpdateUserDto> {
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

    async create(createDto: CreateUserDto): Promise<UserResponseDto> {
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

        // Convertir la date de naissance en objet Date si fournie
        if (createDto.birthdate) {
            userData.birthdate = new Date(createDto.birthdate);
        }

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

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.model.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return users.map(user => this.toUserResponseDto(user));
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.model.findUnique({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
        }

        return this.toUserResponseDto(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        // Vérifier que l'utilisateur existe
        const existingUser = await this.findOne(id);

        // Filtrer les champs vides/undefined/null pour ne mettre à jour que les champs fournis
        const updateData = Object.keys(updateUserDto).reduce((acc, key) => {
            const value = updateUserDto[key];
            if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        // Si aucune donnée à mettre à jour, retourner l'utilisateur existant
        if (Object.keys(updateData).length === 0) {
            return existingUser;
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

        const updatedUser = await this.model.update({
            where: { id },
            data: updateData
        });

        return this.toUserResponseDto(updatedUser);
    }

    async remove(id: string): Promise<UserResponseDto> {
        const user = await this.findOne(id);
        
        // Supprimer l'image de profil si elle existe
        if (user.profilePicture) {
            await this.deleteProfileImageFile(user.profilePicture);
        }

        const deletedUser = await this.model.delete({
            where: { id }
        });

        return this.toUserResponseDto(deletedUser);
    }

    // Méthodes spécifiques à User

    async findByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.model.findUnique({
            where: { email }
        });
        return user ? this.toUserResponseDto(user) : null;
    }

    async findUsers(filters: {
        search?: string;
        country?: string;
        city?: string;
        role?: string;
        isEmailVerified?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        users: UserResponseDto[];
        total: number;
        page: number;
        limit: number;
    }> {
        const { search, country, city, role, isEmailVerified, page = 1, limit = 10 } = filters;
        
        const where: any = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (country) where.country = { contains: country, mode: 'insensitive' };
        if (city) where.city = { contains: city, mode: 'insensitive' };
        if (role) where.role = role as UserRole;
        if (typeof isEmailVerified === 'boolean') where.isEmailVerified = isEmailVerified;

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

    async updateProfile(id: string, updateData: Partial<UpdateUserDto>): Promise<UserResponseDto> {
        // Seuls certains champs sont autorisés pour la mise à jour du profil
        const allowedFields = ['name', 'description', 'country', 'city', 'birthdate', 'phone', 'webSite'];
        const filteredData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        return this.update(id, filteredData);
    }

    async markProfileAsComplete(id: string): Promise<UserResponseDto> {
        const updatedUser = await this.model.update({
            where: { id },
            data: { isCompleteProfile: true }
        });

        return this.toUserResponseDto(updatedUser);
    }

    async getUserStats(): Promise<{
        total: number;
        verified: number;
        unverified: number;
        completeProfiles: number;
        incompleteProfiles: number;
        byRole: Record<string, number>;
        byCountry: Record<string, number>;
    }> {
        const [
            total,
            verified,
            completeProfiles,
            roleStats,
            countryStats
        ] = await Promise.all([
            this.model.count(),
            this.model.count({ where: { isEmailVerified: true } }),
            this.model.count({ where: { isCompleteProfile: true } }),
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
            completeProfiles,
            incompleteProfiles: total - completeProfiles,
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

    async createWithProfileImage(createUserDto: CreateUserDto, file: Express.Multer.File): Promise<UserResponseDto> {
        const user = await this.create(createUserDto);
        if (file) {
            return this.uploadProfileImage(user.id, file);
        }
        return user;
    }

    async updateWithProfileImage(id: string, updateUserDto: UpdateUserDto, file: Express.Multer.File): Promise<UserResponseDto> {
        // Effectuer la mise à jour des données utilisateur d'abord
        let updatedUser;
        if (Object.keys(updateUserDto).length > 0) {
            updatedUser = await this.update(id, updateUserDto);
        } else {
            updatedUser = await this.findOne(id);
        }
        
        // Si une nouvelle image est fournie, la traiter
        if (file) {
            // uploadProfileImage s'occupera de supprimer l'ancienne image
            return this.uploadProfileImage(id, file);
        }
        
        return updatedUser;
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
        return userWithoutSensitiveInfo;
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
}
