import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GetWebsocketsService } from './get-websockets.service';
import { Server, Socket } from 'socket.io';
import { JwtSigner } from 'src/common/utils/jwt-signer';

@WebSocketGateway({ cors: true , namespace: '/get' })
export class GetWebsocketsGateway  implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer() wss : Server; 
  constructor(private readonly getWebsocketsService: GetWebsocketsService, private readonly  jwt: JwtSigner) {}


  handleConnection(client: Socket ) {
    try {
    this.getWebsocketsService.registerClient(client);
    const token =  client.handshake.headers.authentication as string;
    const payload = this.jwt.verify(token);
    const iglesiaId = payload.iglesiaId;
    client.join(`iglesia-${iglesiaId}`);
    } catch (error) {
      return client.disconnect();
    }
  }

  handleDisconnect( client: Socket ) {
    this.getWebsocketsService.removeClient(client.id);
  }

   emitMembersUpdate(iglesiaId: string, members: any[]) {
    this.wss
      .to(`iglesia-${iglesiaId}`)
      .emit('members-update', members);
  }
  
}
