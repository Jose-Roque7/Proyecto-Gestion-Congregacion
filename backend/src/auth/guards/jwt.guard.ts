// src/auth/jwt-auth.guard.ts
import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { UsuariosService } from '../../usuarios/usuarios.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly usersService: UsuariosService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    // Verificamos si el usuario existe en la base de datos
    const userId: string = user.id;
    const exists = await this.usersService.findOneById(userId);

    if (!exists) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return true;
  }
}