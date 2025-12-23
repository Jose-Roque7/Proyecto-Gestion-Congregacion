import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ROOT)
  @UseGuards(ApiKeyGuard, JwtAuthGuard, RolesGuard) 
  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.service.create(dto);
  }

}
