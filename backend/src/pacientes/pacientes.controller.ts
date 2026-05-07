import { Controller, Get, Post, Body, UseGuards, ParseIntPipe, Delete, Param } from "@nestjs/common";
import { PacientesService } from "./pacientes.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { CrearPacienteDto } from "./dto/crear-paciente.dto";

@Controller("api/pacientes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Get()
  @Roles("admin", "recepcionista")
  listar() {
    return this.pacientesService.listar();
  }

  @Post()
  @Roles("admin", "recepcionista")
  crear(@Body() dto: CrearPacienteDto) {
    return this.pacientesService.crear(dto);
  }

  @Delete(":id")
  @Roles("admin")
  eliminar(@Param("id", ParseIntPipe)id: number) {
    return this.pacientesService.eliminar(id)
  }
}
