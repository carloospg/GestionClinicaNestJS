import { Module } from "@nestjs/common";
import { EventosGateway } from "./eventos.gateway";
import { EventosService } from "./eventos.service";

@Module({
  providers: [EventosGateway, EventosService],
  exports: [EventosService],
})
export class EventosModule {}
