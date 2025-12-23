import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req} from '@nestjs/common';
import { MiembrosService } from './miembros.service';
import { CreateMiembroDto } from './dto/create-miembro.dto';
import { UpdateMiembroDto } from './dto/update-miembro.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/common/enums/roles.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { IglesiaId } from 'src/common/decorators/iglesia-id.decorator';

@Controller('miembros')
export class MiembrosController {
  constructor(private readonly miembrosService: MiembrosService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ROOT)
  @UseGuards(ApiKeyGuard, JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() dto: CreateMiembroDto) {
    return this.miembrosService.create(dto);
  }

  @UseGuards(ApiKeyGuard, JwtAuthGuard)
  @Get()
  findAll(@IglesiaId() iglesiaId: string) {
    return this.miembrosService.findAll(iglesiaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.miembrosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMiembroDto: UpdateMiembroDto) {
    return this.miembrosService.update(+id, updateMiembroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.miembrosService.remove(+id);
  }
}
