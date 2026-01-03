import { Controller, Post, Body, Put, Param, UseGuards } from '@nestjs/common';
import { CreateFamiliasDto } from './dto/create-familia.dto';
import { FamiliaMiembroDto } from './dto/create-familia.dto';
import { FamiliasService } from './familias.service';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('familias')
export class FamiliasController {
  constructor(private readonly familiasService: FamiliasService) {}
  
  @UseGuards(JwtAuthGuard, ApiKeyGuard)
  @Post()
  createFamilia(@Body() createFamiliasDto: CreateFamiliasDto) {
    // createFamiliasDto.miembros será un array de FamiliaMiembroDto validado
    return this.familiasService.create(createFamiliasDto);
  }

  @Put(':id/miembros')
  addMiembroToFamilia(
    @Param('id') familiaId: number,
    @Body() familiaMiembroDto: FamiliaMiembroDto
  ) {
    // Si familiaId viene de la ruta, no es necesario en el DTO
    return this.familiasService.addMiembro(familiaId, familiaMiembroDto);
  }
}