import { validate } from 'class-validator';
import { CreateLikeDto } from '../dto/create-like.dto';

describe('CreateLikeDto', () => {
    let dto: CreateLikeDto;

    beforeEach(() => {
        dto = new CreateLikeDto();
    });

    describe('Valid data', () => {
        it('should pass validation with valid project like data', async () => {
            dto.userId = 'user-123';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid post like data', async () => {
            dto.userId = 'user-123';
            dto.postId = 'post-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid comment like data', async () => {
            dto.userId = 'user-123';
            dto.commentId = 'comment-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('Invalid data', () => {
        it('should fail validation when userId is missing', async () => {
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        });

        it('should fail validation when userId is not a UUID', async () => {
            dto.userId = 'not-a-uuid';
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when projectId is not a UUID', async () => {
            dto.userId = 'user-123';
            dto.projectId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when postId is not a UUID', async () => {
            dto.userId = 'user-123';
            dto.postId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when commentId is not a UUID', async () => {
            dto.userId = 'user-123';
            dto.commentId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when no target is specified', async () => {
            dto.userId = 'user-123';
            // No projectId, postId, or commentId

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            // Should fail custom validation requiring at least one target
        });

        it('should fail validation when multiple targets are specified', async () => {
            dto.userId = 'user-123';
            dto.projectId = 'project-123';
            dto.postId = 'post-123';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            // Should fail custom validation allowing only one target
        });
    });
});
