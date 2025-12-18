import { Module } from '@nestjs/common';
import { FamiliasService } from './familias.service';
import { FamiliasController } from './familias.controller';

@Module({
  controllers: [FamiliasController],
  providers: [FamiliasService],
})
export class FamiliasModule {}
