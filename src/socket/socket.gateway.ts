import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {EmitToRoomEventEntity} from './entities/emitToRoomEvent.entity';

const { APP_SOCKET_NAMESPACE } = process.env;

@WebSocketGateway({ namespace: APP_SOCKET_NAMESPACE })
export class SocketGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleDisconnect(client: Socket): Promise<void> {
    Logger.log(`disconnect user: ${client}`);
  }

  @SubscribeMessage('createRoom')
  private createRoom(
    @ConnectedSocket() client: Socket,
  ): void {
    Logger.log(`created new room, by client with socketId: ${client.id}`);
    client.join(`${client.id}-room`);
    this.server.to(`${client.id}-room`).emit('roomCreated', {roomId: `${client.id}-room`});
  }

  @SubscribeMessage('joinRoom')
  private joinRoom(
      @MessageBody() roomId: string,
      @ConnectedSocket() client: Socket,
  ): void {
    const rooms = this.server.sockets.adapter.rooms;
    if (rooms.hasOwnProperty(roomId)) {
      Logger.log(`client joined to the room: ${roomId}-room`);
      client.join(`${roomId}-room`);
      this.server.to(`${roomId}-room`).emit('clientJoined', {roomId: `${roomId}-room`, clientId: client.id});
    } else {
      Logger.log(`client  fails to join to the room: ${roomId}-room`);
      client.error({code: 0, msg: 'invalid room id'});
      client.disconnect(true);
    }
  }

  @SubscribeMessage('emitToRoom')
  private callMe(
      @MessageBody() emitToRoomEvent: EmitToRoomEventEntity,
      @ConnectedSocket() client: Socket,
  ): void {
    Logger.log('new emitToRoomEvent');
    Logger.log(JSON.stringify(emitToRoomEvent));
    this.server.to(emitToRoomEvent.roomId).emit(emitToRoomEvent.eventType, {clientId: client.id, payload: emitToRoomEvent.payload});
  }
}
