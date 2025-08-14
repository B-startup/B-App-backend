import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiBearerAuth
} from '@nestjs/swagger';
import { Connect } from '@prisma/client';
import { ConnectService } from './connect.service';
import { CreateConnectDto } from './dto/create-connect.dto';
import { UpdateConnectDto } from './dto/update-connect.dto';
import { TokenProtected } from '../../../core/common/decorators/token-protected.decorator';

@ApiTags('Connects')
@ApiBearerAuth()
@Controller('connects')
export class ConnectController {
    constructor(private readonly connectService: ConnectService) {}

    @TokenProtected()
    @Post()
    @ApiOperation({ summary: 'Create a connection request' })
    @ApiCreatedResponse({ description: 'Connection request created' })
    @ApiBadRequestResponse({ description: 'Invalid input' })
    create(@Body() dto: CreateConnectDto): Promise<Connect> {
        return this.connectService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all connection requests' })
    @ApiOkResponse({ description: 'List of connections' })
    findAll(): Promise<Connect[]> {
        return this.connectService.findAll();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search by status or user/project ID' })
    search(@Query('q') keyword: string): Promise<Connect[]> {
        return this.connectService.search(keyword, ['userId', 'projectId']);
    }

    @Get('paginate')
    paginate(
        @Query('skip') skip = 0,
        @Query('take') take = 10
    ): Promise<Connect[]> {
        return this.connectService.paginate(Number(skip), Number(take));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get connect by ID' })
    @ApiOkResponse({ description: 'Connect found' })
    findOne(@Param('id') id: string): Promise<Connect> {
        return this.connectService.findOne(id);
    }

    @TokenProtected()
    @Patch(':id')
    @ApiOperation({ summary: 'Update connect' })
    @ApiOkResponse({ description: 'Connect updated' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateConnectDto
    ): Promise<Connect> {
        return this.connectService.update(id, dto);
    }

    @TokenProtected()
    @Delete(':id')
    @ApiOperation({ summary: 'Delete connect' })
    @ApiOkResponse({ description: 'Connect deleted' })
    remove(@Param('id') id: string): Promise<Connect> {
        return this.connectService.remove(id);
    }
}
