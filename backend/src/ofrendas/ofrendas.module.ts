import { Module } from '@nestjs/common';
import { OfrendasService } from './ofrendas.service';
import { OfrendasController } from './ofrendas.controller';

@Module({
  controllers: [OfrendasController],
  providers: [OfrendasService],
})
export class OfrendasModule {}
