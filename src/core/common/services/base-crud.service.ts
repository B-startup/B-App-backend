import { PrismaClient } from '@prisma/client';
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

    create(data: CreateDto): Promise<T> {
        return this.model.create({ data });
    }

    findAll(): Promise<T[]> {
        return this.model.findMany();
    }

    findOne(id: string): Promise<T> {
        return this.model.findUnique({ where: { id } });
    }

    update(id: string, data: UpdateDto): Promise<T> {
        return this.model.update({ where: { id }, data });
    }

    async remove(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }

    findBy<K extends keyof T>(key: K, value: T[K]): Promise<T | null> {
        return this.model.findFirst({ where: { [key]: value } });
    }

    findManyBy<K extends keyof T>(key: K, value: T[K]): Promise<T[]> {
        return this.model.findMany({ where: { [key]: value } });
    }

    paginate(skip = 0, take = 10): Promise<T[]> {
        return this.model.findMany({ skip, take });
    }

    search(keyword: string, fields: (keyof T)[]): Promise<T[]> {
        const OR = fields.map((field) => ({
            [field]: {
                contains: keyword,
                mode: 'insensitive'
            }
        }));
        return this.model.findMany({ where: { OR } });
    }
}
