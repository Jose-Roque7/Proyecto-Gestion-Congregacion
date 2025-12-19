import { Module } from '@nestjs/common';
import { GetWebsocketsService } from './get-websockets.service';
import { GetWebsocketsGateway } from './get-websockets.gateway';

@Module({
  providers: [GetWebsocketsGateway, GetWebsocketsService],
})
export class GetWebsocketsModule {}
