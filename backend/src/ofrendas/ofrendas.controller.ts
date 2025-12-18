import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OfrendasService } from './ofrendas.service';
import { CreateOfrendaDto } from './dto/create-ofrenda.dto';
import { UpdateOfrendaDto } from './dto/update-ofrenda.dto';

@Controller('ofrendas')
export class OfrendasController {
  constructor(private readonly ofrendasService: OfrendasService) {}

  @Post()
  create(@Body() createOfrendaDto: CreateOfrendaDto) {
    return this.ofrendasService.create(createOfrendaDto);
  }

  @Get()
  findAll() {
    return this.ofrendasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ofrendasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfrendaDto: UpdateOfrendaDto) {
    return this.ofrendasService.update(+id, updateOfrendaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ofrendasService.remove(+id);
  }
}
