import { Controller, Post, Body, UseGuards, Get, Request, Patch, Param, ParseIntPipe } from "@nestjs/common";
import { CitasService } from "./citas.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { CrearCitaDto } from "./dto/crear-cita.dto";
import { CambiarEstadoDto } from "./dto/cambiar-estado.dto";

@Controller("api/citas")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @Roles("admin", "recepcionista")
  crear(@Body() dto: CrearCitaDto) {
    return this.citasService.crear(dto);
  }

  @Get()
  @Roles("admin", "recepcionista")
  listarTodas() {
    return this.citasService.listarTodas();
  }

  @Get("stats/finalizadas")
  @Roles("admin", "medico")
  citasFinalizadasPorMedico(@Request() req: any) {
    return this.citasService.citasFinalizadasPorMedico(req.user.id, req.user.rol);
  }

  @Get("mis-citas")
  @Roles("medico")
  listarMisCitas(@Request() req: any) {
    return this.citasService.listarMisCitas(req.user.id);
  }

  @Patch(":id/cancelar")
  @Roles("admin", "recepcionista")
  cancelar(@Param("id", ParseIntPipe) id: number) {
    return this.citasService.cancelar(id)
  }

  @Patch(":id/estado")
  @Roles("medico")
  cambiarEstado(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
    @Request() req: any,
  ) {
    return this.citasService.cambiarEstado(id, req.user.id, dto);
  }

  @Get("stats/pendientes-hoy")
  @Roles("admin", "medico")
  citasPendientesHoy(@Request() req: any) {
    return this.citasService.citasPendientesHoy(req.user.id, req.user.rol);
  }
}
