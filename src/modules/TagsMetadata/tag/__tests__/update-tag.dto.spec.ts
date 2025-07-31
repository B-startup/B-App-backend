import { UpdateTagDto } from '../dto/update-tag.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

describe('UpdateTagDto', () => {
    let dto: UpdateTagDto;

    beforeEach(() => {
        dto = new UpdateTagDto();
    });

    describe('name', () => {
        it('should be valid when name is not provided (optional)', async () => {
            dto.description = 'Updated description';

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBeUndefined();
        });

        it('should be valid with a proper name', async () => {
            dto.name = 'Updated Fintech';

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
        });

        it('should fail if name is an empty string when provided', async () => {
            dto.name = '';

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail if name is not a string when provided', async () => {
            (dto as any).name = 123;

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail if name exceeds maximum length when provided', async () => {
            dto.name = 'a'.repeat(101); // Exceeds maxLength of 100

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should trim whitespace from name when provided', () => {
            const name = '  Updated Fintech  ';
            const dtoObject = plainToClass(UpdateTagDto, { name });
            
            expect(dtoObject.name).toBe('Updated Fintech');
        });
    });

    describe('description', () => {
        it('should be valid when description is not provided (optional)', async () => {
            dto.name = 'Updated name';

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.description).toBeUndefined();
        });

        it('should be valid with a proper description', async () => {
            dto.description = 'Updated financial technology';

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
        });

        it('should fail if description is not a string when provided', async () => {
            (dto as any).description = 123;

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail if description exceeds maximum length when provided', async () => {
            dto.description = 'a'.repeat(501); // Exceeds maxLength of 500

            const dtoObject = plainToClass(UpdateTagDto, dto);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(1);
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should trim whitespace from description when provided', () => {
            const description = '  Updated financial technology  ';
            const dtoObject = plainToClass(UpdateTagDto, { description });
            
            expect(dtoObject.description).toBe('Updated financial technology');
        });
    });

    describe('complete validation', () => {
        it('should pass validation with all valid fields', async () => {
            const validData = {
                name: 'Updated Fintech',
                description: 'Updated financial technology description'
            };

            const dtoObject = plainToClass(UpdateTagDto, validData);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBe('Updated Fintech');
            expect(dtoObject.description).toBe('Updated financial technology description');
        });

        it('should pass validation with only name', async () => {
            const validData = {
                name: 'Updated AI'
            };

            const dtoObject = plainToClass(UpdateTagDto, validData);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBe('Updated AI');
            expect(dtoObject.description).toBeUndefined();
        });

        it('should pass validation with only description', async () => {
            const validData = {
                description: 'Updated description only'
            };

            const dtoObject = plainToClass(UpdateTagDto, validData);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBeUndefined();
            expect(dtoObject.description).toBe('Updated description only');
        });

        it('should pass validation with empty object (all fields optional)', async () => {
            const validData = {};

            const dtoObject = plainToClass(UpdateTagDto, validData);
            const errors = await validate(dtoObject);

            expect(errors).toHaveLength(0);
            expect(dtoObject.name).toBeUndefined();
            expect(dtoObject.description).toBeUndefined();
        });
    });
});
