import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';
import { Partnership } from '@prisma/client';
import { PartnershipService } from './partnership.service';
import { CreatePartnershipDto } from './dto/create-partnership.dto';
import { UpdatePartnershipDto } from './dto/update-partnership.dto';

@ApiTags('Partnerships')
@Controller('partnership')
export class PartnershipController {
    constructor(private readonly partnershipService: PartnershipService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new partnership' })
    @ApiCreatedResponse({ description: 'Partnership created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid input data' })
    create(@Body() dto: CreatePartnershipDto): Promise<Partnership> {
        return this.partnershipService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all partnerships' })
    @ApiOkResponse({ description: 'List of partnerships' })
    findAll(): Promise<Partnership[]> {
        return this.partnershipService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a partnership by ID' })
    @ApiOkResponse({ description: 'Partnership found' })
    @ApiNotFoundResponse({ description: 'Partnership not found' })
    findOne(@Param('id') id: string): Promise<Partnership> {
        return this.partnershipService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a partnership' })
    @ApiOkResponse({ description: 'Partnership updated successfully' })
    update(
      @Param('id') id: string,
      @Body() dto: UpdatePartnershipDto
    ): Promise<Partnership> {
        return this.partnershipService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a partnership' })
    @ApiOkResponse({ description: 'Partnership deleted successfully' })
    remove(@Param('id') id: string): Promise<Partnership> {
        return this.partnershipService.remove(id);
    }
}
