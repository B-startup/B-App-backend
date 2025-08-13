import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { ExperienceEducationService } from './experience_education.service';
import { CreateExperienceEducationDto } from './dto/create-experience_education.dto';
import { UpdateExperienceEducationDto } from './dto/update-experience_education.dto';
import { Experience_Education } from '@prisma/client';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('ExperienceEducation')
@ApiBearerAuth()
@Controller('experience-education')
export class ExperienceEducationController {
    constructor(private readonly service: ExperienceEducationService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a new experience or education entry' })
    @ApiCreatedResponse({ description: 'Entry created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid data' })
    create(
        @Body() dto: CreateExperienceEducationDto
    ): Promise<Experience_Education> {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all experiences and educations' })
    @ApiOkResponse({ description: 'List of entries' })
    findAll(): Promise<Experience_Education[]> {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get an entry by ID' })
    @ApiOkResponse({ description: 'Entry found' })
    @ApiNotFoundResponse({ description: 'Entry not found' })
    findOne(@Param('id') id: string): Promise<Experience_Education> {
        return this.service.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update an entry' })
    @ApiOkResponse({ description: 'Entry updated' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateExperienceEducationDto
    ): Promise<Experience_Education> {
        return this.service.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete an entry' })
    @ApiOkResponse({ description: 'Entry deleted' })
    remove(@Param('id') id: string): Promise<Experience_Education> {
        return this.service.remove(id);
    }
}
