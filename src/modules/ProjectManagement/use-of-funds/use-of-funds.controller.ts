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
    ApiBadRequestResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { UseOfFunds } from '@prisma/client';
import { UseOfFundsService } from './use-of-funds.service';
import { CreateUseOfFundsDto } from './dto/create-use-of-fund.dto';
import { UpdateUseOfFundDto } from './dto/update-use-of-fund.dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Use of Funds')
@ApiBearerAuth()
@Controller('use-of-funds')
export class UseOfFundsController {
    constructor(private readonly useOfFundsService: UseOfFundsService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create new fund allocation' })
    @ApiCreatedResponse({ description: 'Use of funds entry created' })
    @ApiBadRequestResponse({ description: 'Invalid input' })
    create(@Body() dto: CreateUseOfFundsDto): Promise<UseOfFunds> {
        return this.useOfFundsService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all fund allocations' })
    @ApiOkResponse({ description: 'List of use-of-funds entries' })
    findAll(): Promise<UseOfFunds[]> {
        return this.useOfFundsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get fund allocation by ID' })
    @ApiOkResponse({ description: 'Use of funds entry found' })
    @ApiNotFoundResponse({ description: 'Entry not found' })
    findOne(@Param('id') id: string): Promise<UseOfFunds> {
        return this.useOfFundsService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update fund allocation' })
    @ApiOkResponse({ description: 'Use of funds entry updated' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateUseOfFundDto
    ): Promise<UseOfFunds> {
        return this.useOfFundsService.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete fund allocation' })
    @ApiOkResponse({ description: 'Use of funds entry deleted' })
    remove(@Param('id') id: string): Promise<UseOfFunds> {
        return this.useOfFundsService.remove(id);
    }
}
