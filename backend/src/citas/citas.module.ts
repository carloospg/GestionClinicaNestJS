import { Module } from "@nestjs/common";
import { CitasController } from "./citas.controller";
import { CitasService } from "./citas.service";
import { PrismaModule } from "../prisma/prisma.module";
import { EventosModule } from "src/eventos/eventos.module";

@Module({
  imports: [PrismaModule, EventosModule],
  controllers: [CitasController],
  providers: [CitasService],
})
export class CitasModule {}
