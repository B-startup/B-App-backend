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
    ParseUUIDPipe,
    Query,
    Res,
    BadRequestException,
    UseGuards
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
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { UploadFileDto } from './dto/upload-file.dto';
import { File, FileType, User } from '@prisma/client';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';
import { ResourceOwnerGuard } from '../../../core/common/guards/resource-owner.guard';
import { CurrentUser } from '../../../core/common/decorators/current-user.decorator';

import * as fs from 'fs';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post()
    @TokenProtected()
    @ApiOperation({ summary: 'Create a new file record' })
    @ApiResponse({
        status: 201,
        description: 'File record created successfully',
        type: Object
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    create(
        @Body() createFileDto: CreateFileDto,
        @CurrentUser() _user: User
    ): Promise<File> {
        return this.fileService.create(createFileDto);
    }

    @Post('upload')
    @TokenProtected()
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a file and create record' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File upload with project information',
        schema: {
            type: 'object',
            properties: {
                projectId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID of the project'
                },
                fileType: {
                    type: 'string',
                    enum: Object.values(FileType),
                    description: 'Type of the file'
                },
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'File uploaded and record created successfully'
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - Invalid file or parameters'
    })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async uploadFile(
        @Body() uploadFileDto: UploadFileDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() _user: User
    ): Promise<File> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        return this.fileService.uploadFile(uploadFileDto, file);
    }

    @Get()
    @TokenProtected()
    @ApiOperation({ summary: 'Get all files' })
    @ApiQuery({
        name: 'projectId',
        required: false,
        description: 'Filter by project ID'
    })
    @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
    async findAll(
        @CurrentUser() _user: User,
        @Query('projectId') projectId?: string
    ): Promise<File[]> {
        if (projectId) {
            return this.fileService.findByProject(projectId);
        }
        return this.fileService.findAll();
    }

    @Get('project/:projectId')
    @TokenProtected()
    @ApiOperation({ summary: 'Get all files for a specific project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project files retrieved successfully'
    })
    @ApiResponse({ status: 404, description: 'Project not found' })
    findByProject(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @CurrentUser() _user: User
    ): Promise<File[]> {
        return this.fileService.findByProject(projectId);
    }

    @Get('project/:projectId/stats')
    @TokenProtected()
    @ApiOperation({ summary: 'Get file statistics for a project' })
    @ApiParam({ name: 'projectId', description: 'Project ID' })
    @ApiResponse({
        status: 200,
        description: 'Project file statistics retrieved successfully'
    })
    @ApiResponse({ status: 404, description: 'Project not found' })
    getProjectStats(
        @Param('projectId', ParseUUIDPipe) projectId: string,
        @CurrentUser() _user: User
    ): Promise<{
        totalFiles: number;
        filesByType: Record<FileType, number>;
        totalSizeBytes: number;
    }> {
        return this.fileService.getProjectFileStats(projectId);
    }

    @Get(':id')
    @TokenProtected()
    @ApiOperation({ summary: 'Get a file by ID' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File retrieved successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    findOne(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() _user: User
    ): Promise<File> {
        return this.fileService.findOne(id);
    }

    @Get(':id/download')
    @TokenProtected()
    @ApiOperation({ summary: 'Download a file' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File downloaded successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
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

    @Patch(':id')
    @TokenProtected()
    @UseGuards(ResourceOwnerGuard)
    @ApiOperation({ summary: 'Update a file record' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File updated successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateFileDto: UpdateFileDto,
        @CurrentUser() _user: User
    ): Promise<File> {
        return this.fileService.update(id, updateFileDto);
    }

    @Delete(':id')
    @TokenProtected()
    @UseGuards(ResourceOwnerGuard)
    @ApiOperation({ summary: 'Delete a file record and physical file' })
    @ApiParam({ name: 'id', description: 'File ID' })
    @ApiResponse({ status: 200, description: 'File deleted successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not the owner' })
    remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() _user: User
    ): Promise<File> {
        return this.fileService.remove(id);
    }
}
