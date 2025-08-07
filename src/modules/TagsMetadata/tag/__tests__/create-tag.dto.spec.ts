import { CreateTagDto } from '../dto/create-tag.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('CreateTagDto', () => {
    let dto: CreateTagDto;

    beforeEach(() => {
        dto = new CreateTagDto();
    });

    describe('name', () => {
        it('should be valid with a proper name', async () => {
            dto.name = 'Fintech';
            dto.description = 'Financial technology';

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
        });

        it('should fail if name is empty', async () => {
            dto.name = '';
            dto.description = 'Description';

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail if name is not a string', async () => {
            (dto as any).name = 123;

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail if name exceeds maximum length', async () => {
            dto.name = 'a'.repeat(101); // Exceeds maxLength of 100

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should trim whitespace from name', () => {
            const name = '  Fintech  ';
            const dtoObject = plainToClass(CreateTagDto, { name });

            expect(dtoObject.name).toBe('Fintech');
        });
    });

    describe('description', () => {
        it('should be valid when description is not provided', async () => {
            dto.name = 'Fintech';

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.description).toBeUndefined();
        });

        it('should be valid with a proper description', async () => {
            dto.name = 'Fintech';
            dto.description = 'Financial technology';

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
        });

        it('should fail if description is not a string', async () => {
            dto.name = 'Fintech';
            (dto as any).description = 123;

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail if description exceeds maximum length', async () => {
            dto.name = 'Fintech';
            dto.description = 'a'.repeat(501); // Exceeds maxLength of 500

            const dtoObject = plainToClass(CreateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should trim whitespace from description', () => {
            const description = '  Financial technology  ';
            const dtoObject = plainToClass(CreateTagDto, {
                name: 'Fintech',
                description
            });

            expect(dtoObject.description).toBe('Financial technology');
        });
    });

    describe('complete validation', () => {
        it('should pass validation with all valid fields', async () => {
            const validData = {
                name: 'Fintech',
                description: 'Financial technology related posts and projects'
            };

            const dtoObject = plainToClass(CreateTagDto, validData);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBe('Fintech');
            expect(dtoObject.description).toBe(
                'Financial technology related posts and projects'
            );
        });

        it('should pass validation with only required fields', async () => {
            const validData = {
                name: 'AI'
            };

            const dtoObject = plainToClass(CreateTagDto, validData);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBe('AI');
            expect(dtoObject.description).toBeUndefined();
        });
    });
});
