import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarRolDto } from "./dto/actualizar-rol.dto";

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarUsuarios() {
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
      },
      orderBy: { id: "asc" },
    });

    return { ok: true, usuarios };
  }

  async listarMedicos() {
    const medicos = await this.prisma.usuario.findMany({
      where: { rol: "medico" },
      select: { id: true, nombre: true, email: true},
      orderBy: { nombre: "asc" },
    });
    return {ok: true, medicos };
  }

  async eliminarUsuario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    if (usuario.rol === "admin") {
      throw new Error("No se puede eliminar a un admin");
    }

    await this.prisma.usuario.delete({ where: { id } });

    return { ok: true, msg: "Usuario eliminado", usuario };
  }

  async actualizarRol(id: number, actualizarRolDto: ActualizarRolDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const usuarioActualizado = await this.prisma.usuario.update({
      where: {id},
      data: {rol: actualizarRolDto.rol}
    })

    return {
      ok: true,
      msg: 'Rol actualizado correctamente',
      usuario: {
        id: usuarioActualizado.id,
        nombre: usuarioActualizado.nombre,
        email: usuarioActualizado.email,
        rol: usuarioActualizado.rol
      }
    }
  }
}
