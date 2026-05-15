import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CrearPacienteDto } from "./dto/crear-paciente.dto";
import {faker} from "@faker-js/faker/locale/es"

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

  async eliminar(id: number) {
    const paciente = await this.prisma.paciente.findUnique({ where: { id } });
    if (!paciente) {
      throw new NotFoundException({
        ok: false,
        message: "Paciente no encontrado",
      });
    }

    await this.prisma.paciente.delete({ where: { id } });
    return {
      ok: true,
      message: "Paciente eliminado correctamente",
    };
  }

  async generarAleatorios(cantidad: number) {
    const pacientes: any[] = [];

    for (let i = 0; i < cantidad; i++) {
      const paciente = await this.prisma.paciente.create({
        data: {
          nombre: faker.person.firstName(),
          apellidos: faker.person.lastName() + " " + faker.person.lastName(),
          dni: faker.string.alphanumeric(8).toUpperCase(),
          telefono: faker.phone.number(),
          fecha_nacimiento: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
        },
      });
      pacientes.push(paciente);
    }

    return { ok: true, message: `${cantidad} pacientes generados correctamente` };
  }
}
