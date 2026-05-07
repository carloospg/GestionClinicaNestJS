import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearPacienteDto } from "./dto/crear-paciente.dto";

@Injectable()
export class PacientesService {
  constructor(private prisma: PrismaService) {}

  async listar() {
    const pacientes = await this.prisma.paciente.findMany({
      orderBy: { id: "asc" },
    });
    return { ok: true, pacientes };
  }

  async crear(dto: CrearPacienteDto) {
    const existe = await this.prisma.paciente.findUnique({
      where: { dni: dto.dni },
    });
    if (existe) {
      throw new ConflictException({
        ok: false,
        message: "Ya existe un paciente con ese DNI",
      });
    }

    const paciente = await this.prisma.paciente.create({
      data: {
        ...dto,
        fecha_nacimiento: dto.fecha_nacimiento
          ? new Date(dto.fecha_nacimiento)
          : null,
      },
    });
    return { ok: true, paciente };
  }
}
