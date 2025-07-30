import { Injectable, ConflictException } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { PrismaService } from '../../../core/services/prisma.service';
import { BaseService } from '../../../core/services/base.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService extends BaseService<
    Tag,
    CreateTagDto,
    UpdateTagDto,
    'Tag'
> {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.tag, 'Tag');
    }

    // Méthodes CRUD héritées du BaseService :
    // - create(createTagDto: CreateTagDto): Promise<Tag>
    // - findAll(): Promise<Tag[]>
    // - findByUser(userId: string): Promise<Tag[]>
    // - findOne(id: string): Promise<Tag>
    // - findOneOrFail(id: string): Promise<Tag>
    // - update(id: string, updateTagDto: UpdateTagDto): Promise<Tag>
    // - remove(id: string): Promise<Tag>

    // Méthodes personnalisées pour le modèle Tag

    /**
     * Vérifie si un tag avec le nom donné existe déjà
     */
    async findByName(name: string): Promise<Tag | null> {
        return this.prisma.tag.findUnique({
            where: { name: name.trim() }
        });
    }

    /**
     * Crée un tag avec vérification d'unicité du nom
     */
    async createTag(createTagDto: CreateTagDto): Promise<Tag> {
        const { name } = createTagDto;
        
        // Vérifier si un tag avec ce nom existe déjà
        const existingTag = await this.findByName(name);
        if (existingTag) {
            throw new ConflictException(`Tag with name "${name}" already exists`);
        }

        return this.create(createTagDto);
    }

    /**
     * Met à jour un tag avec vérification d'unicité du nom
     */
    async updateTag(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
        // Vérifier que le tag existe
        await this.findOneOrFail(id);

        // Si le nom est fourni, vérifier l'unicité
        if (updateTagDto.name) {
            const existingTag = await this.findByName(updateTagDto.name);
            if (existingTag && existingTag.id !== id) {
                throw new ConflictException(`Tag with name "${updateTagDto.name}" already exists`);
            }
        }

        return this.update(id, updateTagDto);
    }

    /**
     * Recherche des tags par nom (recherche partielle)
     */
    async searchByName(searchTerm: string): Promise<Tag[]> {
        return this.prisma.tag.findMany({
            where: {
                name: {
                    contains: searchTerm.trim(),
                    mode: 'insensitive'
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Trouve tous les tags avec le nombre d'utilisations (projets + posts)
     */
    async findAllWithUsageCount(): Promise<any[]> {
        return this.prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        projectTags: true,
                        PostTag: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Trouve les tags les plus utilisés
     */
    async findMostUsedTags(limit: number = 10): Promise<any[]> {
        const tags = await this.prisma.tag.findMany({
            include: {
                _count: {
                    select: {
                        projectTags: true,
                        PostTag: true
                    }
                }
            }
        });

        // Trier par nombre total d'utilisations (projets + posts)
        return tags
            .map(tag => ({
                ...tag,
                totalUsage: tag._count.projectTags + tag._count.PostTag
            }))
            .sort((a, b) => b.totalUsage - a.totalUsage)
            .slice(0, limit);
    }

    /**
     * Trouve tous les tags utilisés dans les projets
     */
    async findProjectTags(): Promise<Tag[]> {
        return this.prisma.tag.findMany({
            where: {
                projectTags: {
                    some: {}
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    /**
     * Trouve tous les tags utilisés dans les posts
     */
    async findPostTags(): Promise<Tag[]> {
        return this.prisma.tag.findMany({
            where: {
                PostTag: {
                    some: {}
                }
            },
            orderBy: { name: 'asc' }
        });
    }
}
