import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { BaseCrudService } from '../interfaces/base-crud.interface';

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

    async create(data: CreateDto): Promise<T> {
        return this.model.create({ data });
    }

    async findAll(): Promise<T[]> {
        return this.model.findMany();
    }

    async findByUser(userId: string): Promise<T[]> {
        return this.model.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
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

    async findBy<K extends keyof T>(key: K, value: T[K]): Promise<T | null> {
        return this.model.findFirst({ where: { [key]: value } });
    }

    async findManyBy<K extends keyof T>(key: K, value: T[K]): Promise<T[]> {
        return this.model.findMany({ where: { [key]: value } });
    }

    async paginate(skip = 0, take = 10): Promise<T[]> {
        return this.model.findMany({ 
            skip, 
            take,
            orderBy: { createdAt: 'desc' }
        });
    }

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
}
