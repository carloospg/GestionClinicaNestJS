import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
}
