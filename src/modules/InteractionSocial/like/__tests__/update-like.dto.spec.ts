import { validate } from 'class-validator';
import { UpdateLikeDto } from '../dto/update-like.dto';

describe('UpdateLikeDto', () => {
    let dto: UpdateLikeDto;

    beforeEach(() => {
        dto = new UpdateLikeDto();
    });

    describe('Valid data', () => {
        it('should pass validation when empty (no updates needed)', async () => {
            // UpdateLikeDto is typically empty for likes since likes are usually just created or deleted
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        // Note: UpdateLikeDto excludes userId but includes other optional fields
        it('should pass validation with valid optional projectId', async () => {
            dto.projectId = 'project-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid optional postId', async () => {
            dto.postId = 'post-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid optional commentId', async () => {
            dto.commentId = 'comment-123';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('Invalid data', () => {
        it('should fail validation when projectId is not a UUID', async () => {
            dto.projectId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when postId is not a UUID', async () => {
            dto.postId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });

        it('should fail validation when commentId is not a UUID', async () => {
            dto.commentId = 'not-a-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints).toHaveProperty('isUuid');
        });
    });
});
