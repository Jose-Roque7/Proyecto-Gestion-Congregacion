import { Controller, Get } from '@nestjs/common';
import { IglesiaService } from './iglesia.service';

@Controller('iglesias')
export class IglesiaController {
  constructor(private readonly service: IglesiaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
