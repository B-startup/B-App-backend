import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UseOfFundsService } from './use-of-funds.service';
import { CreateUseOfFundDto } from './dto/create-use-of-fund.dto';
import { UpdateUseOfFundDto } from './dto/update-use-of-fund.dto';

@Controller('use-of-funds')
export class UseOfFundsController {
  constructor(private readonly useOfFundsService: UseOfFundsService) {}

  @Post()
  create(@Body() createUseOfFundDto: CreateUseOfFundDto) {
    return this.useOfFundsService.create(createUseOfFundDto);
  }

  @Get()
  findAll() {
    return this.useOfFundsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.useOfFundsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUseOfFundDto: UpdateUseOfFundDto) {
    return this.useOfFundsService.update(+id, updateUseOfFundDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.useOfFundsService.remove(+id);
  }
}
