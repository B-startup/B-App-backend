import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete
} from '@nestjs/common';
import { PostSectorService } from './post-sector.service';
import { CreatePostSectorDto } from './dto/create-post-sector.dto';
import { UpdatePostSectorDto } from './dto/update-post-sector.dto';

@Controller('post-sector')
export class PostSectorController {
    constructor(private readonly postSectorService: PostSectorService) {}

    @Post()
    create(@Body() createPostSectorDto: CreatePostSectorDto) {
        return this.postSectorService.create(createPostSectorDto);
    }

    @Get()
    findAll() {
        return this.postSectorService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postSectorService.findOne(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updatePostSectorDto: UpdatePostSectorDto
    ) {
        return this.postSectorService.update(+id, updatePostSectorDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.postSectorService.remove(+id);
    }
}
