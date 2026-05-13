import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class HistorialService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerHistorial(id_paciente: number) {
    const historial = await this.prisma.historialClinico.findUnique({
      where: { id_paciente },
      include: {
        entradas: {
          orderBy: { fecha: "desc" },
          include: {
            historial: false,
          },
        },
        paciente: { select: { nombre: true, apellidos: true, dni: true } },
      },
    });

    if (!historial) {
      throw new NotFoundException({
        ok: false,
        message: "No existe historial para este paciente",
      });
    }

    return { ok: true, historial };
  }
}
