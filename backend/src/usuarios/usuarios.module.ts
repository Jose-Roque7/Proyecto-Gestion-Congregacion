import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/user.entity';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Iglesiaconfig } from 'src/iglesia/entities/iglesia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Iglesiaconfig])],
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [UsuariosService],
})
export class UsuariosModule {}
