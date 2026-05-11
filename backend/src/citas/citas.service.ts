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
}
