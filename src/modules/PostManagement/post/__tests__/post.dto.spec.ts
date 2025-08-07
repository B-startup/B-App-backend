import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PaginationDto } from '../dto/pagination.dto';

describe('Post DTOs', () => {
    describe('CreatePostDto', () => {
        it('should pass validation with valid data', async () => {
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: 'Valid Post Title',
                content: 'This is a valid post content',
                isPublic: true,
                mlPrediction: 'some-prediction'
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with empty userId', async () => {
            const dto = plainToClass(CreatePostDto, {
                userId: '',
                title: 'Valid title',
                content: 'Valid content',
                isPublic: true
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('userId');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with empty title', async () => {
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: '',
                content: 'Valid content',
                isPublic: true
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('title');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with title exceeding max length', async () => {
            const longTitle = 'a'.repeat(201); // Exceeds 200 char limit
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: longTitle,
                content: 'Valid content',
                isPublic: true
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('title');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should fail validation with empty content', async () => {
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: 'Valid title',
                content: '',
                isPublic: true
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('content');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation with content exceeding max length', async () => {
            const longContent = 'a'.repeat(5001); // Exceeds 5000 char limit
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: 'Valid title',
                content: longContent,
                isPublic: true
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('content');
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should use default value for isPublic', async () => {
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: 'Valid title',
                content: 'Valid content'
                // isPublic not provided
            });

            expect(dto.isPublic).toBe(true);

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should accept optional mlPrediction', async () => {
            const dto = plainToClass(CreatePostDto, {
                userId: 'valid-user-id',
                title: 'Valid title',
                content: 'Valid content',
                isPublic: false
                // mlPrediction not provided (optional)
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('UpdatePostDto', () => {
        it('should pass validation with valid partial data', async () => {
            const dto = plainToClass(UpdatePostDto, {
                title: 'Updated title',
                content: 'Updated content',
                nbLikes: 10,
                isPublic: false
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with empty object (all fields optional)', async () => {
            const dto = plainToClass(UpdatePostDto, {});

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with negative nbLikes', async () => {
            const dto = plainToClass(UpdatePostDto, {
                nbLikes: -1
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('nbLikes');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation with negative nbComments', async () => {
            const dto = plainToClass(UpdatePostDto, {
                nbComments: -5
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('nbComments');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation with negative nbShares', async () => {
            const dto = plainToClass(UpdatePostDto, {
                nbShares: -2
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('nbShares');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation with negative nbViews', async () => {
            const dto = plainToClass(UpdatePostDto, {
                nbViews: -10
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('nbViews');
            expect(errors[0].constraints).toHaveProperty('min');
        });
    });

    describe('PaginationDto', () => {
        it('should pass validation with valid pagination data', async () => {
            const dto = plainToClass(PaginationDto, {
                page: 1,
                limit: 20
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should use default values when not provided', async () => {
            const dto = plainToClass(PaginationDto, {});

            expect(dto.page).toBe(1);
            expect(dto.limit).toBe(20);

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation with page less than 1', async () => {
            const dto = plainToClass(PaginationDto, {
                page: 0
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('page');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation with limit less than minimum', async () => {
            const dto = plainToClass(PaginationDto, {
                limit: 4 // Less than minimum of 5
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('limit');
            expect(errors[0].constraints).toHaveProperty('min');
        });

        it('should fail validation with limit exceeding maximum', async () => {
            const dto = plainToClass(PaginationDto, {
                limit: 51 // Exceeds maximum of 50
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('limit');
            expect(errors[0].constraints).toHaveProperty('max');
        });

        it('should accept boundary values', async () => {
            // Test minimum values
            const minDto = plainToClass(PaginationDto, {
                page: 1,
                limit: 5
            });

            let errors = await validate(minDto);
            expect(errors).toHaveLength(0);

            // Test maximum values
            const maxDto = plainToClass(PaginationDto, {
                page: 999,
                limit: 50
            });

            errors = await validate(maxDto);
            expect(errors).toHaveLength(0);
        });
    });
});
