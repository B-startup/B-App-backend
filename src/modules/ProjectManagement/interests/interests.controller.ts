import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { Interests } from '@prisma/client';

@ApiTags('Interests')
@Controller('interests')
export class InterestsController {
    constructor(private readonly interestsService: InterestsService) {}

    @Post()
    @ApiOperation({ summary: 'Create interest' })
    @ApiCreatedResponse({ description: 'Interest created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid interest data' })
    create(@Body() dto: CreateInterestDto): Promise<Interests> {
        return this.interestsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all interests' })
    @ApiOkResponse({ description: 'List of interests' })
    findAll(): Promise<Interests[]> {
        return this.interestsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get interest by ID' })
    @ApiOkResponse({ description: 'Interest found' })
    @ApiNotFoundResponse({ description: 'Interest not found' })
    findOne(@Param('id') id: string): Promise<Interests> {
        return this.interestsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update interest' })
    @ApiOkResponse({ description: 'Interest updated successfully' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateInterestDto
    ): Promise<Interests> {
        return this.interestsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete interest' })
    @ApiOkResponse({ description: 'Interest deleted successfully' })
    @ApiNotFoundResponse({ description: 'Interest not found' })
    remove(@Param('id') id: string): Promise<Interests> {
        return this.interestsService.remove(id);
    }
}
