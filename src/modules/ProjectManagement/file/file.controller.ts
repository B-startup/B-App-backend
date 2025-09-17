import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseInterceptors,
    UploadedFile,
    ParseUUIDPipe,
    Query,
    Res,
    BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';
import { FileService } from './file.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { FileType, User } from '@prisma/client';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';

import * as fs from 'fs';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a file and create record' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload with project information (type detected automatically)',
        schema: {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID of the project'
                },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (type detected automatically)'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'File uploaded and record created successfully'
    })
    async uploadFile(
        @Body() uploadFileDto: UploadFileDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() _user: User
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Utiliser le type fourni ou le détecter automatiquement
        const fileType = uploadFileDto.fileType || this.detectFileType(file.mimetype);
        
        // Ajouter le type final au DTO
        const uploadDtoWithType = {
            ...uploadFileDto,
            fileType: fileType
        };

        return this.fileService.uploadFile(uploadDtoWithType, file);
    }

    /**
     * Détecte le type de fichier basé sur le MIME type
     */
    private detectFileType(mimeType: string): FileType {
        const mimeTypeToFileType: Record<string, FileType> = {
            'application/pdf': FileType.PDF,
            'image/png': FileType.PNG,
            'image/jpeg': FileType.JPG,
            'image/jpg': FileType.JPG,
            'application/vnd.ms-powerpoint': FileType.PPT,
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': FileType.PPT
        };

        const fileType = mimeTypeToFileType[mimeType];
        if (!fileType) {
            throw new BadRequestException(
                `Unsupported file type: ${mimeType}. Supported types: PDF, PNG, JPG, PPT`
            );
        }

        return fileType;
    }

    @Get()
    @TokenProtected()
    @ApiOperation({ summary: 'Get all files (optimized)' })
    @ApiQuery({
        name: 'projectId',
        required: false,
        description: 'Filter by project ID'
    })
    @ApiQuery({
        name: 'type',
        required: false,
        enum: FileType,
        description: 'Filter by file type'
    })
    @ApiQuery({
        name: 'search',
        required: false,
        description: 'Search files by name'
    })
    @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
    async findAll(
        @CurrentUser() _user: User,
        @Query('projectId') projectId?: string,
        @Query('type') type?: FileType,
        @Query('search') search?: string
    ) {
        if (search) {
            return this.fileService.searchFilesOptimized(search);
        }
        if (type) {
            return this.fileService.findByTypeOptimized(type);
        }
        if (projectId) {
            return this.fileService.findByProjectOptimized(projectId);
        }
        return this.fileService.findAllOptimized();
    }


    @Get(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Get a file with detailed information' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File retrieved successfully' })
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() _user: User
    ) {
        return this.fileService.findOneDetailed(id);
    }

    @Get(':id/download')
    @TokenProtected()
    @ApiOperation({ summary: 'Download a file' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File downloaded successfully' })
    async downloadFile(
        @Param('id', ParseUUIDPipe) id: string,
        @Res() res: Response,
        @CurrentUser() _user: User
    ): Promise<void> {
        const { filePath, fileName } = await this.fileService.downloadFile(id);

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );
        res.setHeader('Content-Type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }

    @Delete(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Delete a file record and physical file' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() _user: User
    ) {
        return this.fileService.remove(id);
    }
}
