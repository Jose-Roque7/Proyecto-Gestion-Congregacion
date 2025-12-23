import { Module } from '@nestjs/common';
import { GetWebsocketsService } from './get-websockets.service';
import { GetWebsocketsGateway } from './get-websockets.gateway';
import { JwtSigner } from 'src/common/utils/jwt-signer';

@Module({
  providers: [GetWebsocketsGateway, GetWebsocketsService , JwtSigner],
  exports: [GetWebsocketsGateway],
})
export class GetWebsocketsModule {}
