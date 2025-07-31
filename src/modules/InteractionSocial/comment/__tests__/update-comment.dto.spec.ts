import { validate } from 'class-validator';
import { UpdateCommentDto } from '../dto/update-comment.dto';

describe('UpdateCommentDto', () => {
    let dto: UpdateCommentDto;

    beforeEach(() => {
        dto = new UpdateCommentDto();
    });

    describe('Valid data', () => {
        it('should pass validation with valid content', async () => {
            dto.content = 'Updated comment content';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with minimum content length', async () => {
            dto.content = 'A'; // Minimum 1 character

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with maximum content length', async () => {
            dto.content = 'A'.repeat(2000); // Maximum 2000 characters

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation when content is undefined (partial update)', async () => {
            // No content property set
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('Invalid data', () => {
        it('should fail validation when content is empty string', async () => {
            dto.content = '';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when content exceeds maximum length', async () => {
            dto.content = 'A'.repeat(2001); // Exceeds 2000 characters

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should fail validation when content contains only whitespace', async () => {
            dto.content = '   '; // Only spaces

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });
    });
});
