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
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiBadRequestResponse
} from '@nestjs/swagger';
import { Offer } from '@prisma/client';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@ApiTags('Offers')
@Controller('offer')
export class OfferController {
    constructor(private readonly offerService: OfferService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new offer' })
    @ApiCreatedResponse({ description: 'Offer created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid data' })
    create(@Body() createOfferDto: CreateOfferDto): Promise<Offer> {
        return this.offerService.create(createOfferDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all offers' })
    @ApiOkResponse({ description: 'List of offers' })
    findAll(): Promise<Offer[]> {
        return this.offerService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get offer by ID' })
    @ApiOkResponse({ description: 'Offer found' })
    @ApiNotFoundResponse({ description: 'Offer not found' })
    findOne(@Param('id') id: string): Promise<Offer> {
        return this.offerService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update offer' })
    @ApiOkResponse({ description: 'Offer updated successfully' })
    @ApiBadRequestResponse({ description: 'Invalid update data' })
    update(
        @Param('id') id: string,
        @Body() updateOfferDto: UpdateOfferDto
    ): Promise<Offer> {
        return this.offerService.update(id, updateOfferDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete offer' })
    @ApiOkResponse({ description: 'Offer deleted successfully' })
    @ApiNotFoundResponse({ description: 'Offer not found' })
    remove(@Param('id') id: string): Promise<Offer> {
        return this.offerService.remove(id);
    }
}
