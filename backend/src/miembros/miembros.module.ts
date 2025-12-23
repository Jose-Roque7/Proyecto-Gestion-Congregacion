import { Module } from '@nestjs/common';
import { MiembrosService } from './miembros.service';
import { MiembrosController } from './miembros.controller';
import { Miembro } from './entities/miembro.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetWebsocketsModule } from 'src/get-websockets/get-websockets.module';
import { AuthModule } from 'src/auth/auth.module';
import { Usuario } from 'src/usuarios/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ Miembro, Usuario]), GetWebsocketsModule, AuthModule],
  controllers: [MiembrosController],
  providers: [MiembrosService],
})
export class MiembrosModule {}
