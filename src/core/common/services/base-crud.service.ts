import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../interfaces/base-crud.interface';

/**
 * Base CRUD Service Implementation with Hybrid Approach Support
 * 
 * This abstract class provides:
 * 1. Standard CRUD operations (create, read, update, delete)
 * 2. Common utility methods (search, pagination, findBy)
 * 3. Smart findByUser method that handles both userId and creatorId
 * 4. Foundation for hybrid approach in derived services
 * 
 * Usage:
 * - Extend this class for standard CRUD operations
 * - Add optimized methods in derived services for performance
 * - Use DTOs for complex business logic
 * - Use direct Prisma selection for simple lists
 */
export abstract class BaseCrudServiceImpl<
    T extends Record<string, any>,
    CreateDto,
    UpdateDto
> implements BaseCrudService<T, CreateDto, UpdateDto>
{
    protected abstract model: any;
    protected prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // ==================== STANDARD CRUD OPERATIONS ====================

    async create(data: CreateDto): Promise<T> {
        return this.model.create({ data });
    }

    async findAll(): Promise<T[]> {
        return this.model.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Smart findByUser method that handles both userId and creatorId patterns
     * Tries userId first, then falls back to creatorId for Project-like entities
     */
    async findByUser(userId: string): Promise<T[]> {
        // For most entities, use userId
        try {
            const result = await this.model.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            // If we get a result or no error, return it
            return result;
        } catch (error) {
            // If userId fails, try creatorId (for Project-like entities)
            try {
                return await this.model.findMany({
                    where: { creatorId: userId },
                    orderBy: { createdAt: 'desc' }
                });
            } catch {
                // If both fail, return empty array
                return [];
            }
        }
    }

    async findOne(id: string): Promise<T> {
        const entity = await this.model.findUnique({ where: { id } });
        if (!entity) {
            throw new NotFoundException(`Entity not found`);
        }
        return entity;
    }

    /**
     * Finds a single entity by its ID or throws a NotFoundException if not found.
     * @param id - The unique identifier of the entity to be found.
     * @returns A promise that resolves to the found entity.
     * @throws NotFoundException if the entity is not found.
     */
    async findOneOrFail(id: string): Promise<T> {
        return this.findOne(id);
    }

    async update(id: string, data: UpdateDto): Promise<T> {
        try {
            return await this.model.update({ where: { id }, data });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(`Entity not found`);
            }
            throw error;
        }
    }

    async remove(id: string): Promise<T> {
        try {
            return await this.model.delete({ where: { id } });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
            ) {
                throw new NotFoundException(`Entity not found`);
            }
            throw error;
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Find entity by any field
     */
    async findBy<K extends keyof T>(key: K, value: T[K]): Promise<T | null> {
        return this.model.findFirst({ where: { [key]: value } });
    }

    /**
     * Find multiple entities by any field
     */
    async findManyBy<K extends keyof T>(key: K, value: T[K]): Promise<T[]> {
        return this.model.findMany({ 
            where: { [key]: value },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Paginate results
     */
    async paginate(skip = 0, take = 10): Promise<T[]> {
        return this.model.findMany({
            skip,
            take,
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Search entities by multiple fields
     */
    async search(keyword: string, fields: (keyof T)[]): Promise<T[]> {
        const OR = fields.map((field) => ({
            [field]: {
                contains: keyword,
                mode: 'insensitive'
            }
        }));
        return this.model.findMany({
            where: { OR },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Count entities with optional where clause
     */
    async count(where?: any): Promise<number> {
        return this.model.count({ where });
    }

    /**
     * Check if entity exists
     */
    async exists(id: string): Promise<boolean> {
        const count = await this.model.count({ where: { id } });
        return count > 0;
    }
}
