import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body
} from '@nestjs/common';
import { AttemptLogService } from './attempt_log.service';
import { CreateAttemptLogDto } from './dto/create-attempt_log.dto';
import { UpdateAttemptLogDto } from './dto/update-attempt_log.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Attempt_log } from '@prisma/client';

@ApiTags('AttemptLog')
@Controller('attempt-log')
export class AttemptLogController {
    constructor(private readonly service: AttemptLogService) {}

    @Post()
    @ApiOperation({ summary: 'Create log entry' })
    create(@Body() dto: CreateAttemptLogDto): Promise<Attempt_log> {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all log entries' })
    findAll(): Promise<Attempt_log[]> {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get log entry by ID' })
    findOne(@Param('id') id: string): Promise<Attempt_log> {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a log entry' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateAttemptLogDto
    ): Promise<Attempt_log> {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a log entry' })
    remove(@Param('id') id: string): Promise<Attempt_log> {
        return this.service.remove(id);
    }
}
