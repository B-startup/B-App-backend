import {
    validate,
} from 'class-validator';
import { CreateVideoDto, UpdateVideoDto } from '../dto';

describe('Video DTOs', () => {
    describe('CreateVideoDto', () => {
        it('should validate a valid CreateVideoDto', async () => {
            const dto = new CreateVideoDto();
            dto.title = 'Test Video';
            dto.description = 'Test video description';
            dto.projectId = '123e4567-e89b-12d3-a456-426614174000';
            dto.duration = 120;
            dto.thumbnailUrl = 'http://example.com/thumbnail.jpg';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when title is empty', async () => {
            const dto = new CreateVideoDto();
            dto.title = '';
            dto.projectId = '123e4567-e89b-12d3-a456-426614174000';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.find(e => e.property === 'title')).toBeTruthy();
        });

        it('should fail validation when projectId is not UUID', async () => {
            const dto = new CreateVideoDto();
            dto.title = 'Test Video';
            dto.projectId = 'invalid-uuid';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.find(e => e.property === 'projectId')).toBeTruthy();
        });

        it('should fail validation when duration is negative', async () => {
            const dto = new CreateVideoDto();
            dto.title = 'Test Video';
            dto.projectId = '123e4567-e89b-12d3-a456-426614174000';
            dto.duration = -10;

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.find(e => e.property === 'duration')).toBeTruthy();
        });

        it('should allow optional fields to be undefined', async () => {
            const dto = new CreateVideoDto();
            dto.title = 'Test Video';
            dto.projectId = '123e4567-e89b-12d3-a456-426614174000';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });
    });

    describe('UpdateVideoDto', () => {
        it('should validate a valid UpdateVideoDto', async () => {
            const dto = new UpdateVideoDto();
            dto.id = '123e4567-e89b-12d3-a456-426614174000';
            dto.title = 'Updated Video Title';
            dto.description = 'Updated description';

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should allow all fields to be optional', async () => {
            const dto = new UpdateVideoDto();

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should fail validation when id is not UUID', async () => {
            const dto = new UpdateVideoDto();
            dto.id = 'invalid-uuid';
            dto.title = 'Updated Title';

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.find(e => e.property === 'id')).toBeTruthy();
        });

        it('should fail validation when duration is negative', async () => {
            const dto = new UpdateVideoDto();
            dto.duration = -5;

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.find(e => e.property === 'duration')).toBeTruthy();
        });
    });
});
