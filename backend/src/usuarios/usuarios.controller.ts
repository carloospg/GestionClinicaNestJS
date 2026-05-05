import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('api/usuarios')
export class UsuariosController {

  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listar() {
    return this.usuariosService.listarUsuarios();
  }
}