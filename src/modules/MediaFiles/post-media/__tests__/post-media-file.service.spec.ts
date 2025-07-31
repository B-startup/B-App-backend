import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PostMediaFileService } from '../post-media-file.service';
import { PostMediaType } from '@prisma/client';

describe('PostMediaFileService', () => {
    let service: PostMediaFileService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostMediaFileService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string, defaultValue?: string) => {
                            if (key === 'UPLOAD_DIRECTORY') return 'uploads';
                            return defaultValue;
                        })
                    }
                }
            ]
        }).compile();

        service = module.get<PostMediaFileService>(PostMediaFileService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('uploadFile', () => {
        const mockImageFile: Express.Multer.File = {
            fieldname: 'file',
            originalname: 'test-image.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 1024 * 1024, // 1MB
            buffer: Buffer.from('fake-image-data'),
            destination: '',
            filename: '',
            path: '',
            stream: null
        };

        it('should upload an image file successfully', async () => {
            const result = await service.uploadFile(mockImageFile, PostMediaType.IMAGE);
            
            expect(result).toHaveProperty('mediaUrl');
            expect(result).toHaveProperty('filename');
            expect(result.mediaUrl).toContain('/uploads/postMedia/images/');
            expect(result.filename).toContain('test-image.jpg');
        });

        it('should throw error for oversized file', async () => {
            const oversizedFile = {
                ...mockImageFile,
                size: 6 * 1024 * 1024 // 6MB (over 5MB limit for images)
            };

            await expect(
                service.uploadFile(oversizedFile, PostMediaType.IMAGE)
            ).rejects.toThrow('File too large');
        });

        it('should throw error for invalid mime type', async () => {
            const invalidFile = {
                ...mockImageFile,
                mimetype: 'application/pdf'
            };

            await expect(
                service.uploadFile(invalidFile, PostMediaType.IMAGE)
            ).rejects.toThrow('Invalid image type');
        });
    });
});
