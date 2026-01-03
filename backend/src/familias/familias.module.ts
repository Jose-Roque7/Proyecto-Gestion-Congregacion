import { Module } from '@nestjs/common';
import { FamiliasService } from './familias.service';
import { FamiliasController } from './familias.controller';
import { AuthModule } from 'src/auth/auth.module';
import { GetWebsocketsModule } from 'src/get-websockets/get-websockets.module';
import { Familias } from './entities/familias.entity';
import { Familia } from './entities/familia.entity';
import { Miembro } from 'src/miembros/entities/miembro.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';
import { Usuario } from 'src/usuarios/entities/user.entity';

@Module({
  controllers: [FamiliasController],
  providers: [FamiliasService],
  imports: [TypeOrmModule.forFeature([ Miembro, Familias, Familia, Iglesiaconfig, Usuario]), GetWebsocketsModule, AuthModule],
})
export class FamiliasModule {}
