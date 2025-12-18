import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IglesiaService } from './iglesia.service';
import { IglesiaController } from './iglesia.controller';
import { Iglesiaconfig } from './entities/iglesia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Iglesiaconfig])],
  providers: [IglesiaService],
  controllers: [IglesiaController],
  exports: [IglesiaService],
})
export class IglesiaModule {}
