import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { HistorialService } from "./historial.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";

@Controller("api/historial")
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistorialController {
  constructor(private readonly historialService: HistorialService) {}

  @Get(":id_paciente")
  @Roles("medico", "admin")
  obtenerHistorial(@Param("id_paciente", ParseIntPipe) id_paciente: number) {
    return this.historialService.obtenerHistorial(id_paciente);
  }
}
