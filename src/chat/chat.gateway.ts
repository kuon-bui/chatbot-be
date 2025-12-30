import { JwtService } from '@nestjs/jwt';
import * as ws from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MessageDto } from '@dto';
import { Message } from '@schemas';

/**
 * WebSocket Gateway for real-time chat functionality
 * 
 * Connection URL: ws://localhost:3000/ws
 * Namespace: /chat
 * 
 * Authentication:
 * - Include JWT token in handshake auth: { auth: { token: 'your-jwt-token' } }
 * - Or in headers: { headers: { authorization: 'Bearer your-jwt-token' } }
 * 
 * Events:
 * 
 * Client -> Server:
 * - 'chat': Send a message to a channel
 *   Payload: { channelId: string, content: string }
 *   Response: { event: 'chat', data: Message[] }
 * 
 * - 'listMessages': Get all messages in a channel
 *   Payload: { channelId: string }
 *   Response: { event: 'listMessages', data: Message[] }
 * 
 * Server -> Client:
 * - 'message': Welcome message on connection
 *   Payload: string
 * 
 * - 'chat': Response with updated messages after sending
 *   Payload: Message[]
 * 
 * - 'listMessages': Response with all messages in channel
 *   Payload: Message[]
 */
@ApiTags('WebSocket')
@ws.WebSocketGateway({
  namespace: '/chat',
  path: '/ws',
  cors: { origin: '*' },
  transports: ['websocket'],
})
export class ChatGateway implements ws.OnGatewayConnection, ws.OnGatewayInit, ws.OnGatewayDisconnect {
  @ws.WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('ChatGateway');
  constructor(
    private readonly jwtService: JwtService,
    private readonly chatService: ChatService,
  ) { }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  afterInit(server: Server) {
    this.logger.log('Chat Gateway Initialized');
    // this.logger.log(`Server running on port: `);
    // console.log(server.h);
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connecting: ${client.id}`);
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      console.log(token);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = payload;
      client.emit('message', 'Welcome to the chat server!');
      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      console.error('Connection authentication failed:', error.message);
      client.disconnect();
    }
  }

  @ws.SubscribeMessage('chat')
  async handleEvent(@ws.MessageBody() data: MessageDto, @ws.ConnectedSocket() client: Socket): Promise<ws.WsResponse<Message[]>> {
    const messages = await this.chatService.receiveMessage(data.channelId, client.data.user.sub, data.content);
    return { event: 'chat', data: messages };
  }

  @ws.SubscribeMessage('listMessages')
  async listAllMessagesInChannel(
    @ws.MessageBody("channelId") channelId: string
  ): Promise<ws.WsResponse<Message[]>> {
    const messages = await this.chatService.listAllMessagesInChannel(channelId);
    return { event: 'listMessages', data: messages };
  }
}
