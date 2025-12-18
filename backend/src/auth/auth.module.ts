import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtSigner } from './../common/utils/jwt-signer';

import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsuariosModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
    JwtSigner, // ← tu firmador personalizado
  ],

  exports: [
    AuthService,
    JwtSigner,
    PassportModule,
  ],
})
export class AuthModule {}
