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
import { SectorService } from './modules/projectManagement/sector/sector.service';
import { CreateSectorDto } from './modules/projectManagement/sector/dto/create-sector.dto';
import { UpdateSectorDto } from './modules/projectManagement/sector/dto/update-sector.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('sector')
@Controller('sector')
export class SectorController {
    constructor(private readonly sectorService: SectorService) {}

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
        return this.sectorService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get sector by ID' })
    @ApiResponse({ status: 200, description: 'Sector found' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    findOne(@Param('id') id: string) {
        return this.sectorService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update sector by ID' })
    @ApiResponse({ status: 200, description: 'Sector updated successfully' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    update(@Param('id') id: string, @Body() dto: UpdateSectorDto) {
        return this.sectorService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete sector by ID' })
    @ApiResponse({ status: 204, description: 'Sector deleted successfully' })
    @ApiNotFoundResponse({ description: 'Sector not found' })
    remove(@Param('id') id: string) {
        return this.sectorService.remove(id);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search sectors by keyword' })
    @ApiResponse({ status: 200, description: 'Search results returned' })
    search(@Query('q') keyword: string) {
        return this.sectorService.search(keyword, ['name', 'description']);
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get paginated list of sectors' })
    @ApiResponse({ status: 200, description: 'Paginated sectors returned' })
    paginate(@Query('skip') skip = 0, @Query('take') take = 10) {
        return this.sectorService.paginate(Number(skip), Number(take));
    }
}
