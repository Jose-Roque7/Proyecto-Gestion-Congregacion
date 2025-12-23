import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtSigner } from './../common/utils/jwt-signer';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';
import { MiembrosService } from 'src/miembros/miembros.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/user.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
     TypeOrmModule.forFeature([
      Usuario,        // Para UsuarioRepository
      Iglesiaconfig   // Para IglesiaconfigRepository (si tu UsuariosService lo usa)
    ]),
    UsuariosModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    UsuariosService,
    JwtStrategy,
    JwtAuthGuard,
    JwtSigner, // ← tu firmador personalizado
  ],

  exports: [
    AuthService,
    JwtSigner,
    PassportModule,
    JwtAuthGuard,
  ],
})
export class AuthModule {}
