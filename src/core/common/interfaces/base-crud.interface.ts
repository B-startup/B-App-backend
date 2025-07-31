export interface BaseCrudService<T, CreateDto, UpdateDto> {
    create(data: CreateDto): Promise<T>;
    findAll(): Promise<T[]>;
    findOne(id: string): Promise<T>;
    update(id: string, data: UpdateDto): Promise<T>;
    remove(id: string): Promise<T>;

    // Méthodes avancées
    findBy<K extends keyof T>(key: K, value: T[K]): Promise<T | null>;
    findManyBy<K extends keyof T>(key: K, value: T[K]): Promise<T[]>;
    paginate(skip: number, take: number): Promise<T[]>;
    search(keyword: string, fields: (keyof T)[]): Promise<T[]>;
    
    // Méthodes supplémentaires de BaseService
    findByUser(userId: string): Promise<T[]>;
    findOneOrFail(id: string): Promise<T>;
}
