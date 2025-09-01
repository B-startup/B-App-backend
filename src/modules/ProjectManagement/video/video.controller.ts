import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    HttpCode,
    HttpStatus,
    Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiConsumes,
    ApiBearerAuth
} from '@nestjs/swagger';
import { VideoService } from './video.service';
import { UpdateVideoDto, VideoResponseDto, UploadVideoDto } from './dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { GetCurrentUserId } from '../../../core/common/decorators/get-current-user-id.decorator';

@ApiTags('Project Videos')
@ApiBearerAuth()
@Controller('project-videos')
export class VideoController {
    constructor(private readonly videoService: VideoService) {}

    @TokenProtected()
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a video file with automatic duration analysis' })
    @ApiBody({
        description: 'Video upload data with automatic duration detection',
        type: UploadVideoDto
    })
    @ApiResponse({
        status: 201,
        description: 'Video uploaded successfully with duration analyzed',
        type: VideoResponseDto
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async uploadVideo(
        @UploadedFile() file: Express.Multer.File,
        @Body() uploadData: UploadVideoDto,
        @GetCurrentUserId() userId: string
    ): Promise<VideoResponseDto> {
        return await this.videoService.uploadVideo(file, uploadData, userId);
    }

    @TokenProtected()
    @Get()
    @ApiOperation({ summary: 'Get all videos' })
    @ApiQuery({
        name: 'projectId',
        required: false,
        description: 'Filter by project ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Videos retrieved successfully',
        type: [VideoResponseDto]
    })
    async findAll(@Query('projectId') projectId?: string): Promise<VideoResponseDto[]> {
        if (projectId) {
            return await this.videoService.findByProjectWithDto(projectId);
        }
        return await this.videoService.findAllWithDto();
    }

    @TokenProtected()
    @Get('count/project/:projectId')
    @ApiOperation({ summary: 'Count videos for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Video count retrieved successfully',
        schema: {
            example: { count: 5 }
        }
    })
    async countByProject(@Param('projectId') projectId: string) {
        const count = await this.videoService.countByProject(projectId);
        return { count };
    }

    @TokenProtected()
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
        summary: 'Update video metadata and/or change video file',
        description: 'Update video information. Use the "Charger la vidéo" button to upload a new video file that will replace the existing one.'
    })
    @ApiParam({ name: 'id', description: 'Video ID to update' })
    @ApiBody({
        description: 'Video update data with optional file replacement via "Charger la vidéo" button',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'New video file (use "Charger la vidéo" button) - Will replace existing video'
                },
                title: {
                    type: 'string',
                    description: 'Video title',
                    example: 'Mon nouveau titre de vidéo'
                },
                description: {
                    type: 'string',
                    description: 'Video description',
                    example: 'Description mise à jour de la vidéo'
                },
                projectId: {
                    type: 'string',
                    description: 'Project ID (if changing project)',
                    example: 'project-uuid-123'
                },
                thumbnailUrl: {
                    type: 'string',
                    description: 'Thumbnail URL',
                    example: 'https://example.com/thumbnail.jpg'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Video updated successfully',
        type: VideoResponseDto,
        schema: {
            example: {
                id: 'video-uuid-123',
                title: 'Titre mis à jour',
                description: 'Description mise à jour',
                projectId: 'project-uuid-123',
                userId: 'user-uuid-123',
                videoUrl: 'http://localhost:3000/uploads/project-videos/project-uuid/new-video.mp4',
                duration: 185,
                fileSize: 20971520,
                mimeType: 'video/mp4',
                nbViews: 25,
                createdAt: '2025-08-25T10:00:00Z',
                updatedAt: '2025-08-25T15:45:00Z'
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad Request - Invalid file format or size too large',
        schema: {
            example: {
                message: 'Invalid video format. Allowed formats: video/mp4, video/avi, video/mov, video/wmv, video/flv, video/webm, video/mkv',
                error: 'Bad Request',
                statusCode: 400
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Video not found' })
    async update(
        @Param('id') id: string,
        @Body() updateVideoDto: UpdateVideoDto,
        @UploadedFile() file?: Express.Multer.File,
        @GetCurrentUserId() userId?: string
    ): Promise<VideoResponseDto> {
        // Logique spéciale pour le bouton "Charger la vidéo"
        if (file) {
            console.log(`📹 Chargement d'une nouvelle vidéo pour l'ID: ${id}`);
            console.log(`📁 Nom du fichier: ${file.originalname}`);
            console.log(`📊 Taille du fichier: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`🎬 Type MIME: ${file.mimetype}`);
        }

        // Appeler le service avec la logique de remplacement
        const result = await this.videoService.updateWithFileReplacement(id, updateVideoDto, file, userId);

        if (file) {
            console.log(`✅ Vidéo chargée avec succès! Nouvelle durée: ${result.duration}s`);
        }

        return result;
    }

    @TokenProtected()
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete video by ID' })
    @ApiParam({ name: 'id', description: 'Video ID' })
    @ApiResponse({
        status: 204,
        description: 'Video deleted successfully'
    })
    @ApiResponse({ status: 404, description: 'Video not found' })
    async remove(@Param('id') id: string): Promise<void> {
        await this.videoService.remove(id);
    }
}
