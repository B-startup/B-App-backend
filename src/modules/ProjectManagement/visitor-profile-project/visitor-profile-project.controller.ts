import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { VisitorProfileProjectService } from './visitor-profile-project.service';
import { CreateVisitorProfileProjectDto } from './dto/create-visitor-profile-project.dto';
import { UpdateVisitorProfileProjectDto } from './dto/update-visitor-profile-project.dto';
import { 
    ApiTags, 
    ApiOperation, 
    ApiBearerAuth, 
    ApiResponse,
    ApiBody
} from '@nestjs/swagger';
import { VisitorProfileProject } from '@prisma/client';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Visitor Profile Project Management')
@ApiBearerAuth()
@Controller('visitor-profile-project')
export class VisitorProfileProjectController {
    constructor(private readonly service: VisitorProfileProjectService) {}

    @TokenProtected()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
        summary: 'Enregistrer une visite de profil ou projet',
        description: 'Crée un enregistrement de visite et incrémente automatiquement le compteur nbVisits de l\'utilisateur visité'
    })
    @ApiBody({
        type: CreateVisitorProfileProjectDto,
        description: 'Données de la visite',
        examples: {
            'Visite de profil': {
                summary: 'Exemple de visite de profil utilisateur',
                value: {
                    userId: '9cceb4dd-ef81-45fe-ba02-d3060a1f3093',
                    userVisitorId: '63686bb6-5b78-45f1-9d5c-2eef9b0f925e'
                }
            },
            'Visite de projet': {
                summary: 'Exemple de visite de projet',
                value: {
                    projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    userVisitorId: '63686bb6-5b78-45f1-9d5c-2eef9b0f925e'
                }
            },
            'Visite complète': {
                summary: 'Visite d\'un projet d\'un utilisateur spécifique',
                value: {
                    userId: '9cceb4dd-ef81-45fe-ba02-d3060a1f3093',
                    userVisitorId: '63686bb6-5b78-45f1-9d5c-2eef9b0f925e',
                    projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
                }
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Visite enregistrée avec succès'
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Données invalides'
    })
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
