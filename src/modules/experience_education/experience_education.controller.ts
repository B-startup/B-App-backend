import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExperienceEducationService } from './experience_education.service';
import { CreateExperienceEducationDto } from './dto/create-experience_education.dto';
import { UpdateExperienceEducationDto } from './dto/update-experience_education.dto';

@Controller('experience-education')
export class ExperienceEducationController {
  constructor(private readonly experienceEducationService: ExperienceEducationService) {}

  @Post()
  create(@Body() createExperienceEducationDto: CreateExperienceEducationDto) {
    return this.experienceEducationService.create(createExperienceEducationDto);
  }

  @Get()
  findAll() {
    return this.experienceEducationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.experienceEducationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExperienceEducationDto: UpdateExperienceEducationDto) {
    return this.experienceEducationService.update(+id, updateExperienceEducationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.experienceEducationService.remove(+id);
  }
}
