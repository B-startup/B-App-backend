import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { VideoModule } from '../video.module';
import { PrismaService } from '../../../../core/services/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('VideoController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let jwtService: JwtService;

    const mockPrismaService = {
        video: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        project: {
            findUnique: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            const config = {
                PROJECT_VIDEOS_DIR: 'uploads/ProjectVideos',
                BASE_URL: 'http://localhost:8050/',
                JWT_SECRET: 'test-secret',
            };
            return config[key];
        }),
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [VideoModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .compile();

        app = moduleFixture.createNestApplication();
        jwtService = moduleFixture.get<JwtService>(JwtService);
        
        await app.init();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await app.close();
    });

    const generateValidToken = () => {
        return jwtService.sign({ 
            id: 'user-uuid-123', 
            email: 'test@example.com' 
        });
    };

    const mockVideo = {
        id: 'video-uuid-123',
        title: 'Test Video',
        description: 'Test video description',
        projectId: 'project-uuid-123',
        videoUrl: 'http://localhost:8050/uploads/ProjectVideos/video.mp4',
        filePath: 'uploads/ProjectVideos/video.mp4',
        fileSize: 1048576,
        mimeType: 'video/mp4',
        duration: 120,
        thumbnailUrl: 'http://example.com/thumbnail.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockProject = {
        id: 'project-uuid-123',
        title: 'Test Project',
    };

    const mockUser = {
        id: 'user-uuid-123',
        email: 'test@example.com',
        lastLogoutAt: null,
    };

    describe('/project-videos (POST)', () => {
        it('should create a video', async () => {
            const createVideoDto = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'project-uuid-123',
                duration: 120,
                thumbnailUrl: 'http://example.com/thumbnail.jpg',
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
            mockPrismaService.video.create.mockResolvedValue(mockVideo);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .post('/project-videos')
                .set('Authorization', `Bearer ${token}`)
                .send(createVideoDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.title).toBe(createVideoDto.title);
                });
        });

        it('should return 401 without token', async () => {
            const createVideoDto = {
                title: 'Test Video',
                description: 'Test video description',
                projectId: 'project-uuid-123',
            };

            return request(app.getHttpServer())
                .post('/project-videos')
                .send(createVideoDto)
                .expect(401);
        });
    });

    describe('/project-videos (GET)', () => {
        it('should return all videos', async () => {
            const mockVideos = [{ ...mockVideo, project: mockProject }];
            
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findMany.mockResolvedValue(mockVideos);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .get('/project-videos')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBeTruthy();
                    expect(res.body).toHaveLength(1);
                });
        });

        it('should filter videos by projectId when provided', async () => {
            const mockVideos = [{ ...mockVideo, project: mockProject }];
            
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findMany.mockResolvedValue(mockVideos);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .get('/project-videos?projectId=project-uuid-123')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBeTruthy();
                });
        });
    });

    describe('/project-videos/project/:projectId (GET)', () => {
        it('should return videos for a specific project', async () => {
            const mockVideos = [{ ...mockVideo, project: mockProject }];
            
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findMany.mockResolvedValue(mockVideos);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .get('/project-videos/project/project-uuid-123')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(Array.isArray(res.body)).toBeTruthy();
                });
        });
    });

    describe('/project-videos/count/project/:projectId (GET)', () => {
        it('should return video count for a project', async () => {
            const mockCount = 5;
            
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.count.mockResolvedValue(mockCount);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .get('/project-videos/count/project/project-uuid-123')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('count');
                    expect(res.body.count).toBe(mockCount);
                });
        });
    });

    describe('/project-videos/:id (GET)', () => {
        it('should return a video by id', async () => {
            const mockVideoWithProject = { ...mockVideo, project: mockProject };
            
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findUnique.mockResolvedValue(mockVideoWithProject);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .get('/project-videos/video-uuid-123')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                    expect(res.body.id).toBe('video-uuid-123');
                });
        });

        it('should return 404 for non-existent video', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findUnique.mockResolvedValue(null);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .get('/project-videos/non-existent-video')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    describe('/project-videos/:id (PATCH)', () => {
        it('should update a video', async () => {
            const updateVideoDto = {
                title: 'Updated Video Title',
                description: 'Updated description',
            };

            const updatedVideo = { ...mockVideo, ...updateVideoDto, project: mockProject };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
            mockPrismaService.video.update.mockResolvedValue(updatedVideo);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .patch('/project-videos/video-uuid-123')
                .set('Authorization', `Bearer ${token}`)
                .send(updateVideoDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.title).toBe(updateVideoDto.title);
                });
        });
    });

    describe('/project-videos/:id (DELETE)', () => {
        it('should delete a video', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
            mockPrismaService.video.delete.mockResolvedValue(mockVideo);

            const token = generateValidToken();

            return request(app.getHttpServer())
                .delete('/project-videos/video-uuid-123')
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
        });
    });
});
