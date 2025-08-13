import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body
} from '@nestjs/common';
import { VisitorProfileProjectService } from './visitor-profile-project.service';
import { CreateVisitorProfileProjectDto } from './dto/create-visitor-profile-project.dto';
import { UpdateVisitorProfileProjectDto } from './dto/update-visitor-profile-project.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisitorProfileProject } from '@prisma/client';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('VisitorProfileProject')
@ApiBearerAuth()
@Controller('visitor-profile-project')
export class VisitorProfileProjectController {
    constructor(private readonly service: VisitorProfileProjectService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create visitor record' })
    create(
        @Body() dto: CreateVisitorProfileProjectDto
    ): Promise<VisitorProfileProject> {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all visitor records' })
    findAll(): Promise<VisitorProfileProject[]> {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a visitor record by ID' })
    findOne(@Param('id') id: string): Promise<VisitorProfileProject> {
        return this.service.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update a visitor record' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateVisitorProfileProjectDto
    ): Promise<VisitorProfileProject> {
        return this.service.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a visitor record' })
    remove(@Param('id') id: string): Promise<VisitorProfileProject> {
        return this.service.remove(id);
    }
}
