import { Injectable } from "@nestjs/common";
import { Server } from "socket.io";

@Injectable()
export class EventosService {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  emit(event: string, data: any) {
    this.server?.emit(event, data);
  }

  emitToRoom(room: string, event: string, data: any) {
    this.server?.to(room).emit(event, data);
  }
}
