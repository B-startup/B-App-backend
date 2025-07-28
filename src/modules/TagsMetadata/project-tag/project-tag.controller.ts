import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from '@nestjs/common';
import { ProjectTagService } from './project-tag.service';
import { CreateProjectTagDto } from './dto/create-project-tag.dto';
import { UpdateProjectTagDto } from './dto/update-project-tag.dto';

@Controller('project-tag')
export class ProjectTagController {
    constructor(private readonly projectTagService: ProjectTagService) {}

    @Post()
    create(@Body() createProjectTagDto: CreateProjectTagDto) {
        return this.projectTagService.create(createProjectTagDto);
    }

    @Get()
    findAll() {
        return this.projectTagService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.projectTagService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateProjectTagDto: UpdateProjectTagDto
    ) {
        return this.projectTagService.update(+id, updateProjectTagDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.projectTagService.remove(+id);
    }
}
