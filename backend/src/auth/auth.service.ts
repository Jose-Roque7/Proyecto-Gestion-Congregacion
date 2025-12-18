import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { comparePassword } from '../common/utils/password-hasher';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtSigner } from '../common/utils/jwt-signer';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly JwtSigner: JwtSigner,
  ) {}

  async login(dto: LoginUserDto) {
    
    try{
    const user = await this.usuariosService.findByEmail(dto.email);
    const {id, createdAt, updatedAt, ...res} = user.iglesia 
    const payload = {
      id: user.id,
      name: user.nombre,
      iglesiaId: user.iglesia_id,
      rol: user.rol,
      nameChurch: res.nombres,
      logoChurch: res.logo,
    };
    const token = this.JwtSigner.sign(payload);
    return { access_token: token };
    }catch(err){
      return {messege: 'Usuario o contraseña incorrectos'};
    }
  }
}
