import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VisitorProfileProjectService } from './visitor-profile-project.service';
import { CreateVisitorProfileProjectDto } from './dto/create-visitor-profile-project.dto';
import { UpdateVisitorProfileProjectDto } from './dto/update-visitor-profile-project.dto';

@Controller('visitor-profile-project')
export class VisitorProfileProjectController {
  constructor(private readonly visitorProfileProjectService: VisitorProfileProjectService) {}

  @Post()
  create(@Body() createVisitorProfileProjectDto: CreateVisitorProfileProjectDto) {
    return this.visitorProfileProjectService.create(createVisitorProfileProjectDto);
  }

  @Get()
  findAll() {
    return this.visitorProfileProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.visitorProfileProjectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVisitorProfileProjectDto: UpdateVisitorProfileProjectDto) {
    return this.visitorProfileProjectService.update(+id, updateVisitorProfileProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.visitorProfileProjectService.remove(+id);
  }
}
