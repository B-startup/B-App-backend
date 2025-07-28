import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from '@nestjs/common';
import { AttemptLogService } from './attempt_log.service';
import { CreateAttemptLogDto } from './dto/create-attempt_log.dto';
import { UpdateAttemptLogDto } from './dto/update-attempt_log.dto';

@Controller('attempt-log')
export class AttemptLogController {
    constructor(private readonly attemptLogService: AttemptLogService) {}

    @Post()
    create(@Body() createAttemptLogDto: CreateAttemptLogDto) {
        return this.attemptLogService.create(createAttemptLogDto);
    }

    @Get()
    findAll() {
        return this.attemptLogService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.attemptLogService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateAttemptLogDto: UpdateAttemptLogDto
    ) {
        return this.attemptLogService.update(+id, updateAttemptLogDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.attemptLogService.remove(+id);
    }
}
