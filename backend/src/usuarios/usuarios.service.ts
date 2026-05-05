import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      orderBy: { id: 'asc' },
    });

    return { ok: true, usuarios };
  }
}