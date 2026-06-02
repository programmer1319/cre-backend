import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:4200',
      'http://localhost:4000',
      'https://lightpink-hamster-485746.hostingersite.com',
      'http://app.local.test:4200',
      'http://app.local.test:4000',
    ],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected:', client.id);
  }

  sendNotification(userId: number, payload: any) {
    this.server.to(`user_${userId}`).emit('notification', payload);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: number) {
    client.join(`user_${userId}`);
  }
}
