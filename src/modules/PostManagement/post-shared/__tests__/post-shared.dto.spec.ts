import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePostSharedDto } from '../dto/create-post-shared.dto';
import { UpdatePostSharedDto } from '../dto/update-post-shared.dto';

describe('PostShared DTOs', () => {
    describe('CreatePostSharedDto', () => {
        it('should pass validation with valid data', async () => {
            const dto = plainToClass(CreatePostSharedDto, {
                postId: 'valid-post-id',
                userId: 'valid-user-id',
                description: 'Check out this amazing post!'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation without optional description', async () => {
            const dto = plainToClass(CreatePostSharedDto, {
                postId: 'valid-post-id',
                userId: 'valid-user-id'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with empty postId', async () => {
            const dto = plainToClass(CreatePostSharedDto, {
                postId: '',
                userId: 'valid-user-id'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('postId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with empty userId', async () => {
            const dto = plainToClass(CreatePostSharedDto, {
                postId: 'valid-post-id',
                userId: ''
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with description exceeding max length', async () => {
            const longDescription = 'a'.repeat(501); // Exceeds 500 char limit
            const dto = plainToClass(CreatePostSharedDto, {
                postId: 'valid-post-id',
                userId: 'valid-user-id',
                description: longDescription
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('description');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should fail validation with non-string postId', async () => {
            const dto = plainToClass(CreatePostSharedDto, {
                postId: 123,
                userId: 'valid-user-id'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('postId');
            expect(errors[0].constraints).toHaveProperty('isString');
        });

        it('should fail validation with non-string userId', async () => {
            const dto = plainToClass(CreatePostSharedDto, {
                postId: 'valid-post-id',
                userId: 123
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isString');
        });
    });

    describe('UpdatePostSharedDto', () => {
        it('should pass validation with valid partial data', async () => {
            const dto = plainToClass(UpdatePostSharedDto, {
                description: 'Updated description'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with empty object (all fields optional)', async () => {
            const dto = plainToClass(UpdatePostSharedDto, {});

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with description exceeding max length', async () => {
            const longDescription = 'a'.repeat(501); // Exceeds 500 char limit
            const dto = plainToClass(UpdatePostSharedDto, {
                description: longDescription
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('description');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should inherit validation rules from CreatePostSharedDto', async () => {
            const dto = plainToClass(UpdatePostSharedDto, {
                postId: '',
                userId: 'valid-user-id'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('postId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });
    });
});
