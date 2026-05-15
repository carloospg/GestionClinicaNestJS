import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { EventosService } from "./eventos.service";

@WebSocketGateway({ cors: { origin: "*" } })
export class EventosGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly eventosService: EventosService) {}

  afterInit(server: Server) {
    this.eventosService.setServer(server);
  }

  @SubscribeMessage("unirse-sala")
  handleUnirse(client: Socket, id_usuario: string) {
    client.join(`usuario-${id_usuario}`);
  }
}