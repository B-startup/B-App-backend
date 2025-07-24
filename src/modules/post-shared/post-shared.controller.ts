import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostSharedService } from './post-shared.service';
import { CreatePostSharedDto } from './dto/create-post-shared.dto';
import { UpdatePostSharedDto } from './dto/update-post-shared.dto';

@Controller('post-shared')
export class PostSharedController {
  constructor(private readonly postSharedService: PostSharedService) {}

  @Post()
  create(@Body() createPostSharedDto: CreatePostSharedDto) {
    return this.postSharedService.create(createPostSharedDto);
  }

  @Get()
  findAll() {
    return this.postSharedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postSharedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostSharedDto: UpdatePostSharedDto) {
    return this.postSharedService.update(+id, updatePostSharedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postSharedService.remove(+id);
  }
}
