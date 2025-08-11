import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/core/services/prisma.service';
import * as request from 'supertest';

import { AppModule } from './../src/app.module';

describe('User Endpoints with Profile Image (e2e)', () => {
    let app: INestApplication;
    let createdUserId: string;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        prisma = app.get(PrismaService);

        // Clear database
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await app.close();
    });

    // Test image creation helper
    const createTestImage = (): Buffer => {
        // Créer une image PNG simple de 1x1 pixel (minimal)
        const pngData = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
            0x49, 0x48, 0x44, 0x52, // IHDR
            0x00, 0x00, 0x00, 0x01, // width: 1
            0x00, 0x00, 0x00, 0x01, // height: 1
            0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
            0x90, 0x77, 0x53, 0xDE, // IHDR CRC
            0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
            0x49, 0x44, 0x41, 0x54, // IDAT
            0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // image data
            0xE2, 0x21, 0xBC, 0x33, // IDAT CRC
            0x00, 0x00, 0x00, 0x00, // IEND chunk size
            0x49, 0x45, 0x4E, 0x44, // IEND
            0xAE, 0x42, 0x60, 0x82  // IEND CRC
        ]);
        return pngData;
    };

    describe('Standard User Operations', () => {
        it('POST /user - create user (standard)', () => {
            const userData = {
                email: 'user@example.com',
                password: 'StrongPass123!',
                name: 'Test User'
            };
            return request(app.getHttpServer())
                .post('/user')
                .send(userData)
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body.email).toBe(userData.email);
                    expect(response.body.name).toBe(userData.name);
                    expect(response.body.profilePicture).toBeNull();
                    createdUserId = response.body.id;
                });
        });

        it('GET /user - get all users', () => {
            return request(app.getHttpServer())
                .get('/user')
                .expect(200)
                .then((response) => {
                    expect(Array.isArray(response.body)).toBe(true);
                });
        });

        it('GET /user/:id - get one user', () => {
            return request(app.getHttpServer())
                .get(`/user/${createdUserId}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.id).toBe(createdUserId);
                });
        });
    });

    describe('Profile Image Operations', () => {
        it('POST /user/:id/profile-image - upload profile image', () => {
            const testImage = createTestImage();
            
            return request(app.getHttpServer())
                .post(`/user/${createdUserId}/profile-image`)
                .attach('profileImage', testImage, 'test-profile.png')
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('profilePicture');
                    expect(response.body.profilePicture).toContain('profile-images/');
                    expect(response.body.profilePicture).toContain('.png');
                });
        });

        it('POST /user/with-profile-image - create user with profile image', () => {
            const testImage = createTestImage();
            
            return request(app.getHttpServer())
                .post('/user/with-profile-image')
                .field('email', 'userimage@example.com')
                .field('password', 'StrongPass123!')
                .field('name', 'User With Image')
                .attach('profileImage', testImage, 'profile.png')
                .expect(201)
                .then((response) => {
                    expect(response.body).toHaveProperty('id');
                    expect(response.body.email).toBe('userimage@example.com');
                    expect(response.body.profilePicture).toContain('profile-images/');
                });
        });

        it('PATCH /user/:id/with-profile-image - update user with new profile image', () => {
            const testImage = createTestImage();
            
            return request(app.getHttpServer())
                .patch(`/user/${createdUserId}/with-profile-image`)
                .field('name', 'Updated User Name')
                .attach('profileImage', testImage, 'updated-profile.png')
                .expect(200)
                .then((response) => {
                    expect(response.body.name).toBe('Updated User Name');
                    expect(response.body.profilePicture).toContain('profile-images/');
                });
        });

        it('DELETE /user/:id/profile-image - remove profile image', () => {
            return request(app.getHttpServer())
                .delete(`/user/${createdUserId}/profile-image`)
                .expect(200)
                .then((response) => {
                    expect(response.body.profilePicture).toBeNull();
                });
        });
    });

    describe('Error Handling', () => {
        it('POST /user/:id/profile-image - should reject large files', () => {
            // Créer un buffer trop large (plus de 2MB)
            const largeFile = Buffer.alloc(3 * 1024 * 1024, 'a'); // 3MB
            
            return request(app.getHttpServer())
                .post(`/user/${createdUserId}/profile-image`)
                .attach('profileImage', largeFile, 'large.png')
                .expect(400);
        });

        it('POST /user/:id/profile-image - should reject invalid file types', () => {
            const textFile = Buffer.from('This is not an image');
            
            return request(app.getHttpServer())
                .post(`/user/${createdUserId}/profile-image`)
                .attach('profileImage', textFile, 'not-image.txt')
                .expect(400);
        });

        it('POST /user/invalid-id/profile-image - should reject non-existent user', () => {
            const testImage = createTestImage();
            
            return request(app.getHttpServer())
                .post('/user/00000000-0000-0000-0000-000000000000/profile-image')
                .attach('profileImage', testImage, 'test.png')
                .expect(409); // Conflict - user not found
        });
    });

    describe('Cleanup', () => {
        it('DELETE /user/:id - delete user', () => {
            return request(app.getHttpServer())
                .delete(`/user/${createdUserId}`)
                .expect(200);
        });
    });
});
