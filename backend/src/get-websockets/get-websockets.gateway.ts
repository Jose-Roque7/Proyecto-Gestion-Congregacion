import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GetWebsocketsService } from './get-websockets.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true , namespace: '/members' })
export class GetWebsocketsGateway  implements OnGatewayConnection, OnGatewayDisconnect{
  @WebSocketServer() wss : Server; 
  constructor(private readonly getWebsocketsService: GetWebsocketsService) {}

  handleConnection(client: Socket ) {
    this.getWebsocketsService.registerClient(client);
    this.wss.emit('connection', client.id);
  }

  handleDisconnect( client: Socket ) {
    this.getWebsocketsService.removeClient(client.id);

  }
  
  
}
