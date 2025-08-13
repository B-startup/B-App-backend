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
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { Block } from '@prisma/client';
import { BlockService } from './block.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Block')
@ApiBearerAuth()
@Controller('block')
export class BlockController {
    constructor(private readonly blockService: BlockService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create new block' })
    @ApiCreatedResponse({ description: 'Block created successfully' })
    @ApiBadRequestResponse({ description: 'Invalid data' })
    create(@Body() dto: CreateBlockDto): Promise<Block> {
        return this.blockService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all blocks' })
    @ApiOkResponse({ description: 'List of blocks' })
    findAll(): Promise<Block[]> {
        return this.blockService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get block by ID' })
    @ApiOkResponse({ description: 'Block found' })
    @ApiNotFoundResponse({ description: 'Block not found' })
    findOne(@Param('id') id: string): Promise<Block> {
        return this.blockService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update block' })
    @ApiOkResponse({ description: 'Block updated' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateBlockDto
    ): Promise<Block> {
        return this.blockService.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete block' })
    @ApiOkResponse({ description: 'Block deleted' })
    remove(@Param('id') id: string): Promise<Block> {
        return this.blockService.remove(id);
    }
}
