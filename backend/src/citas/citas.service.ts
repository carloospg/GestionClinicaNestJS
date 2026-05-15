import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearCitaDto } from "./dto/crear-cita.dto";
import { CambiarEstadoDto } from "./dto/cambiar-estado.dto";
import { EventosService } from "src/eventos/eventos.service";

@Injectable()
export class CitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventosService: EventosService,
  ) {}

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

    this.eventosService.emitToRoom(
      `usuario-${dto.id_medico}`,
      "cita-asignada",
      {
        msg: "Tienes una nueva cita asignada",
        cita,
      },
    );
    this.eventosService.emit("actualizar-citas", {});

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

    this.eventosService.emit("cita-cancelada", {
      msg: "Una cita ha sido cancelada",
      cita: citaActualizada,
    });

    this.eventosService.emitToRoom(
      `usuario-${cita.id_medico}`,
      "cita-cancelada-medico",
      { msg: "Una de tus citas ha sido cancelada" },
    );
    this.eventosService.emit("actualizar-citas", {});

    return {
      ok: true,
      message: "Cita cancelada correctamente",
      cita: citaActualizada,
    };
  }

  async cambiarEstado(id: number, id_medico: number, dto: CambiarEstadoDto) {
    const cita = await this.prisma.cita.findUnique({ where: { id } });

    if (!cita) {
      throw new NotFoundException({ ok: false, message: "Cita no encontrada" });
    }

    if (cita.id_medico !== id_medico) {
      throw new ForbiddenException({
        ok: false,
        message: "No tienes permiso para modificar esta cita",
      });
    }

    const citaActualizada = await this.prisma.cita.update({
      where: { id },
      data: {
        estado: dto.estado as any,
        updated_at: new Date(),
        ...(dto.estado === "en_curso" && { fecha_inicio: new Date() }),
      },
    });

    if (dto.estado === "finalizada") {
      if (!dto.observaciones || !dto.diagnostico || !dto.tratamiento) {
        throw new BadRequestException({
          ok: false,
          message:
            "Observaciones, diagnostico y tratamiento son obligatorios al finalizar",
        });
      }

      let historial = await this.prisma.historialClinico.findUnique({
        where: { id_paciente: cita.id_paciente },
      });

      if (!historial) {
        historial = await this.prisma.historialClinico.create({
          data: { id_paciente: cita.id_paciente },
        });
      }

      await this.prisma.entradaHistorial.create({
        data: {
          id_historial: historial.id,
          id_medico,
          observaciones: dto.observaciones,
          diagnostico: dto.diagnostico,
          tratamiento: dto.tratamiento,
        },
      });
    }

    this.eventosService.emit("cita-estado-cambiado", {
      msg:
        dto.estado === "en_curso"
          ? "Una cita ha comenzado"
          : "Una cita ha finalizado",
      estado: dto.estado,
      cita: citaActualizada,
    });
    this.eventosService.emit("actualizar-citas", {});

    return {
      ok: true,
      message: "Estado de la cita actualizado",
      cita: citaActualizada,
    };
  }

  async citasFinalizadasPorMedico(id_usuario: number, rol: string) {
    const where = {
      estado: "finalizada" as const,
      ...(rol === "medico" && { id_medico: id_usuario }),
    };
    const resultado = await this.prisma.cita.groupBy({
      by: ["id_medico"],
      where: { estado: "finalizada" },
      _count: { id: true },
    });

    const conNombres = await Promise.all(
      resultado.map(async (r) => {
        const medico = await this.prisma.usuario.findUnique({
          where: { id: r.id_medico },
          select: { nombre: true },
        });
        return {
          medico: medico?.nombre ?? "desconocido",
          total: r._count.id,
        };
      }),
    );
    return { ok: true, datos: conNombres };
  }

  async citasPendientesHoy(id_usuario: number, rol: string) {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const citas = await this.prisma.cita.findMany({
      where: {
        estado: "pendiente",
        fecha_hora: { gte: hoyInicio, lte: hoyFin },
        ...(rol === "medico" && { id_medico: id_usuario }),
      },
      include: {
        paciente: { select: { nombre: true, apellidos: true } },
        medico: { select: { nombre: true } },
      },
      orderBy: { fecha_hora: "asc" },
    });

    return { ok: true, citas };
  }

  async duracionPromedio(id_usuario: number, rol: string) {
    const citas = await this.prisma.cita.findMany({
      where: {
        estado: "finalizada",
        fecha_inicio: { not: null },
        updated_at: { not: null },
        ...(rol === "medico" && { id_medico: id_usuario }),
      },
      select: {
        id_medico: true,
        fecha_inicio: true,
        updated_at: true,
        medico: { select: { nombre: true } },
      },
    });
    const agrupado: Record<number, { nombre: string; duraciones: number[] }> =
      {};

    citas.forEach((c) => {
      const duracion =
        (c.updated_at!.getTime() - c.fecha_inicio!.getTime()) / 60000;
      if (!agrupado[c.id_medico]) {
        agrupado[c.id_medico] = { nombre: c.medico.nombre, duraciones: [] };
      }
      agrupado[c.id_medico].duraciones.push(duracion);
    });

    const datos = Object.values(agrupado).map((m) => ({
      medico: m.nombre,
      promedio_minutos: Math.round(
        m.duraciones.reduce((a, b) => a + b, 0) / m.duraciones.length,
      ),
    }));
    return { ok: true, datos };
  }
}
