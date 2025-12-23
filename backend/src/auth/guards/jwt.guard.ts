// src/auth/jwt-auth.guard.ts - VERSIÓN CORREGIDA
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { UsuariosService } from '../../usuarios/usuarios.service'; // RUTA CORREGIDA
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly usersService: UsuariosService,
    @InjectRepository(Usuario)
     private readonly usuarioRepo: Repository<Usuario>
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
    try {
      // Primero ejecutamos la lógica del padre
      const parentCanActivate = await super.canActivate(context);
      
      if (!parentCanActivate) {
        return false;
      }

      // Obtenemos el usuario del request
      const request = context.switchToHttp().getRequest();
      const user = request.user;      
      if (!user) {
        throw new UnauthorizedException();
      }
      
      const exists = await this.usuarioRepo.findOne({ where: { id: user.id } });
      if (!exists) throw new UnauthorizedException('Usuario no encontrado');
    

      return true;
    } catch (error) {
      console.error('Error en JwtAuthGuard:', error);
      throw error;
    }
  }
}