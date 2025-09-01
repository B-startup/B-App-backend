import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query
} from '@nestjs/common';
import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('sector')
@ApiBearerAuth()
@Controller('sector')
export class SectorController {
    constructor(private readonly sectorService: SectorService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a new sector' })
    @ApiResponse({ status: 201, description: 'Sector created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    create(@Body() dto: CreateSectorDto) {
        return this.sectorService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all sectors' })
    @ApiResponse({ status: 200, description: 'List of sectors returned' })
    findAll() {
        return this.sectorService.findAllOptimized();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search sectors by keyword' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    search(@Query('q') keyword: string) {
        return this.sectorService.searchSectorsOptimized(keyword);
    }


    @Get(':id')
    @ApiOperation({ summary: 'Get sector by ID' })
    @ApiResponse({ status: 200, description: 'Sector found' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    findOne(@Param('id') id: string) {
        return this.sectorService.findOne(id);
    }

    @Get(':id/detailed')
    @ApiOperation({ summary: 'Get sector with full details' })
    @ApiResponse({ status: 200, description: 'Detailed sector returned' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    findOneDetailed(@Param('id') id: string) {
        return this.sectorService.findOneDetailed(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update sector by ID' })
    @ApiResponse({ status: 200, description: 'Sector updated successfully' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
        return this.sectorService.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete sector by ID' })
    @ApiResponse({ status: 204, description: 'Sector deleted successfully' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    remove(@Param('id') id: string) {
        return this.sectorService.remove(id);
    }
}
