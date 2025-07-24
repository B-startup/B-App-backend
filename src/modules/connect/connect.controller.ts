import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConnectService } from './connect.service';
import { CreateConnectDto } from './dto/create-connect.dto';
import { UpdateConnectDto } from './dto/update-connect.dto';

@Controller('connect')
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}

  @Post()
  create(@Body() createConnectDto: CreateConnectDto) {
    return this.connectService.create(createConnectDto);
  }

  @Get()
  findAll() {
    return this.connectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.connectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConnectDto: UpdateConnectDto) {
    return this.connectService.update(+id, updateConnectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.connectService.remove(+id);
  }
}
