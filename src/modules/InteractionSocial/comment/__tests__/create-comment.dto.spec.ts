import { validate } from 'class-validator';
import { CreateCommentDto } from '../dto/create-comment.dto';

describe('CreateCommentDto', () => {
    let dto: CreateCommentDto;

    beforeEach(() => {
        dto = new CreateCommentDto();
    });

    describe('Valid data', () => {
        it('should pass validation with valid project comment data', async () => {
            dto.content = 'This is a valid comment content';
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid post comment data', async () => {
            dto.content = 'This is a valid comment on a post';
            dto.userId = 'user-123';
            dto.postId = 'post-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid reply data', async () => {
            dto.content = 'This is a reply to another comment';
            dto.userId = 'user-123';
            dto.parentId = 'comment-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with minimum content length', async () => {
            dto.content = 'A'; // Minimum 1 character
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with maximum content length', async () => {
            dto.content = 'A'.repeat(2000); // Maximum 2000 characters
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('Invalid data', () => {
        it('should fail validation when content is missing', async () => {
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when content is empty string', async () => {
            dto.content = '';
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when content exceeds maximum length', async () => {
            dto.content = 'A'.repeat(2001); // Exceeds 2000 characters
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('maxLength');
        });

        it('should fail validation when userId is missing', async () => {
            dto.content = 'Valid content';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when userId is not a UUID', async () => {
            dto.content = 'Valid content';
            dto.userId = 'not-a-uuid';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when projectId is not a UUID', async () => {
            dto.content = 'Valid content';
            dto.userId = 'user-123';
            dto.projectId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when postId is not a UUID', async () => {
            dto.content = 'Valid content';
            dto.userId = 'user-123';
            dto.postId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when parentId is not a UUID', async () => {
            dto.content = 'Valid content';
            dto.userId = 'user-123';
            dto.parentId = 'not-a-uuid';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });
});
