import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { UsuariosService } from "./usuarios.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { ActualizarRolDto } from "./dto/actualizar-rol.dto";

@Controller("api/usuarios")
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  listar() {
    return this.usuariosService.listarUsuarios();
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  eliminar(@Param("id") id: string) {
    return this.usuariosService.eliminarUsuario(Number(id));
  }

  @Patch(":id/rol")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  actualizarRol(
    @Param("id") id: string,
    @Body() actualizarRolDto: ActualizarRolDto,
  ) {
    return this.usuariosService.actualizarRol(Number(id), actualizarRolDto);
  }
}
