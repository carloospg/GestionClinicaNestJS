import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearCitaDto } from "./dto/crear-cita.dto";

@Injectable()
export class CitasService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearCitaDto) {
    const paciente = await this.prisma.paciente.findUnique({
      where: { id: dto.id_paciente },
    });
    if (!paciente) {
      throw new NotFoundException({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    const medico = await this.prisma.usuario.findUnique({
      where: { id: dto.id_medico },
    });
    if (!medico || medico.rol !== "medico") {
      throw new BadRequestException({ ok: false, message: "Médico no válido" });
    }

    const cita = await this.prisma.cita.create({
      data: {
        id_paciente: dto.id_paciente,
        id_medico: dto.id_medico,
        fecha_hora: new Date(dto.fecha_hora),
        motivo: dto.motivo,
        estado: "pendiente",
      },
    });

    return { ok: true, message: "Cita creada correctamente", cita };
  }

  async listarTodas() {
    const citas = await this.prisma.cita.findMany({
      orderBy: { id: "asc" },
      include: {
        paciente: { select: { nombre: true, apellidos: true } },
        medico: { select: { nombre: true } },
      },
    });
    return { ok: true, citas };
  }

  async listarMisCitas(id_medico: number) {
    const citas = await this.prisma.cita.findMany({
      where: { id_medico },
      orderBy: { id: "asc" },
      include: {
        paciente: { select: { nombre: true, apellidos: true } },
      },
    });
    return { ok: true, citas };
  }

  async cancelar(id: number) {
    const cita = await this.prisma.cita.findUnique({ where: { id } });

    if (!cita) {
      throw new NotFoundException({ ok: false, message: "Cita no encontrada" });
    }

    if (cita.estado !== "pendiente") {
      throw new BadRequestException({
        ok: false,
        message: "Solo se pueden cancelar citas que esten pendientes",
      });
    }

    const citaActualizada = await this.prisma.cita.update({
      where: { id },
      data: { estado: "cancelada", updated_at: new Date() },
    });

    return {
      ok: true,
      message: "Cita cancelada correctamente",
      cita: citaActualizada,
    };
  }
}
