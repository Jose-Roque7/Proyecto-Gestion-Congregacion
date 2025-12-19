import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MiembrosModule } from './miembros/miembros.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IglesiaModule } from './iglesia/iglesia.module';
import { OfrendasModule } from './ofrendas/ofrendas.module';
import { FamiliasModule } from './familias/familias.module';
import { CursosModule } from './cursos/cursos.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { GetWebsocketsModule } from './get-websockets/get-websockets.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }), MiembrosModule, IglesiaModule, OfrendasModule, FamiliasModule, CursosModule, AuthModule, UsuariosModule, GetWebsocketsModule],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {}
