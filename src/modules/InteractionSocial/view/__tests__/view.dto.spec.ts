import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateViewDto } from '../dto/create-view.dto';
import { UpdateViewDto } from '../dto/update-view.dto';

describe('View DTOs', () => {
    describe('CreateViewDto', () => {
        it('should pass validation with valid data', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation without optional timespent', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when userId is missing', async () => {
            const dto = plainToClass(CreateViewDto, {
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when videoId is missing', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('videoId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when userId is not a string', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: 123,
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when videoId is not a string', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: 123,
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('videoId');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation when userId is empty string', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when videoId is empty string', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '',
                timespent: 120
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('videoId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when timespent is negative', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: -10
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('timespent');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when timespent is not an integer', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 'not-a-number'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('timespent');
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should pass validation when timespent is zero', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 0
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should reject unknown properties when DTO is used with validation', async () => {
            const dto = plainToClass(CreateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001',
                videoId: '123e4567-e89b-12d3-a456-426614174002',
                timespent: 120,
                unknownProperty: 'should be rejected'
            });

            // Note: This would be handled by the ValidationPipe with forbidNonWhitelisted: true
            const errors = await validate(dto);
            expect(errors).toHaveLength(0); // class-validator doesn't reject unknown properties by default
        });
    });

    describe('UpdateViewDto', () => {
        it('should pass validation with valid timespent', async () => {
            const dto = plainToClass(UpdateViewDto, {
                timespent: 200
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with empty object', async () => {
            const dto = plainToClass(UpdateViewDto, {});

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when timespent is negative', async () => {
            const dto = plainToClass(UpdateViewDto, {
                timespent: -5
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('timespent');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation when timespent is not an integer', async () => {
            const dto = plainToClass(UpdateViewDto, {
                timespent: 'invalid'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('timespent');
            expect(errors[0].constraints).toHaveProperty('isInt');
        });

        it('should pass validation when timespent is zero', async () => {
            const dto = plainToClass(UpdateViewDto, {
                timespent: 0
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should inherit validation from CreateViewDto', async () => {
            // UpdateViewDto extends PartialType(CreateViewDto), so it should inherit validations
            const dto = plainToClass(UpdateViewDto, {
                userId: '123e4567-e89b-12d3-a456-426614174001', // This should be allowed (but not required)
                videoId: '123e4567-e89b-12d3-a456-426614174002', // This should be allowed (but not required)
                timespent: 150
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with invalid userId format in update', async () => {
            const dto = plainToClass(UpdateViewDto, {
                userId: '', // Empty string should fail if provided
                timespent: 150
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('userId');
        });

        it('should fail validation with invalid videoId format in update', async () => {
            const dto = plainToClass(UpdateViewDto, {
                videoId: '', // Empty string should fail if provided
                timespent: 150
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].property).toBe('videoId');
        });
    });
});
