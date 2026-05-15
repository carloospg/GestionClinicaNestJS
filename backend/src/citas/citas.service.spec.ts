import { Test, TestingModule } from "@nestjs/testing";
import { CitasService } from "./citas.service";
import { PrismaService } from "../prisma/prisma.service";
import { EventosService } from "../eventos/eventos.service";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";

describe("CitasService", () => {
  let citasService: CitasService;

  const mockPrismaService = {
    cita: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    paciente: {
      findUnique: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
    },
    historialClinico: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    entradaHistorial: {
      create: jest.fn(),
    },
  };

  const mockEventosService = {
    emit: jest.fn(),
    emitToRoom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventosService, useValue: mockEventosService },
      ],
    }).compile();

    citasService = module.get<CitasService>(CitasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // test de crear cits

  describe("crear", () => {
    it("debe crear una cita correctamente", async () => {
      mockPrismaService.paciente.findUnique.mockResolvedValue({
        id: 1,
        nombre: "Paciente Test",
      });
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 2,
        nombre: "Medico Test",
        rol: "medico",
      });
      mockPrismaService.cita.create.mockResolvedValue({
        id: 1,
        id_paciente: 1,
        id_medico: 2,
        fecha_hora: new Date("2025-12-01T10:00:00"),
        motivo: "Revision",
        estado: "pendiente",
      });

      const resultado = await citasService.crear({
        id_paciente: 1,
        id_medico: 2,
        fecha_hora: "2025-12-01T10:00:00",
        motivo: "Revision",
      });

      expect(resultado.ok).toBe(true);
      expect(resultado.cita.estado).toBe("pendiente");
      expect(mockEventosService.emitToRoom).toHaveBeenCalledWith(
        "usuario-2",
        "cita-asignada",
        expect.any(Object),
      );
      expect(mockEventosService.emit).toHaveBeenCalledWith(
        "actualizar-citas",
        {},
      );
    });

    it("debe lanzar NotFoundException si el paciente no existe", async () => {
      mockPrismaService.paciente.findUnique.mockResolvedValue(null);

      await expect(
        citasService.crear({
          id_paciente: 99,
          id_medico: 2,
          fecha_hora: "2025-12-01T10:00:00",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("debe lanzar BadRequestException si el medico no es valido", async () => {
      mockPrismaService.paciente.findUnique.mockResolvedValue({ id: 1 });
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 3,
        rol: "recepcionista",
      });

      await expect(
        citasService.crear({
          id_paciente: 1,
          id_medico: 3,
          fecha_hora: "2025-12-01T10:00:00",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // test de cancelar cita

  describe("cancelar", () => {
    it("debe cancelar una cita pendiente correctamente", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue({
        id: 1,
        estado: "pendiente",
        id_medico: 2,
      });
      mockPrismaService.cita.update.mockResolvedValue({
        id: 1,
        estado: "cancelada",
        id_medico: 2,
      });

      const resultado = await citasService.cancelar(1);

      expect(resultado.ok).toBe(true);
      expect(resultado.cita.estado).toBe("cancelada");
      expect(mockEventosService.emit).toHaveBeenCalledWith(
        "actualizar-citas",
        {},
      );
    });

    it("debe lanzar NotFoundException si la cita no existe", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue(null);

      await expect(citasService.cancelar(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("debe lanzar BadRequestException si la cita no esta pendiente", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue({
        id: 1,
        estado: "en_curso",
        id_medico: 2,
      });

      await expect(citasService.cancelar(1)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // test de cambiar de estado 

  describe("cambiarEstado", () => {
    it("debe cambiar el estado a en_curso correctamente", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue({
        id: 1,
        estado: "pendiente",
        id_medico: 2,
        id_paciente: 1,
      });
      mockPrismaService.cita.update.mockResolvedValue({
        id: 1,
        estado: "en_curso",
        id_medico: 2,
      });

      const resultado = await citasService.cambiarEstado(1, 2, {
        estado: "en_curso",
      });

      expect(resultado.ok).toBe(true);
      expect(resultado.cita.estado).toBe("en_curso");
      expect(mockEventosService.emit).toHaveBeenCalledWith(
        "cita-estado-cambiado",
        expect.any(Object),
      );
    });

    it("debe cambiar el estado a finalizada y crear entrada en historial", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue({
        id: 1,
        estado: "en_curso",
        id_medico: 2,
        id_paciente: 1,
      });
      mockPrismaService.cita.update.mockResolvedValue({
        id: 1,
        estado: "finalizada",
        id_medico: 2,
      });
      mockPrismaService.historialClinico.findUnique.mockResolvedValue({
        id: 1,
        id_paciente: 1,
      });
      mockPrismaService.entradaHistorial.create.mockResolvedValue({ id: 1 });

      const resultado = await citasService.cambiarEstado(1, 2, {
        estado: "finalizada",
        observaciones: "Todo bien",
        diagnostico: "Sano",
        tratamiento: "Reposo",
      });

      expect(resultado.ok).toBe(true);
      expect(resultado.cita.estado).toBe("finalizada");
      expect(mockPrismaService.entradaHistorial.create).toHaveBeenCalled();
    });

    it("debe lanzar NotFoundException si la cita no existe", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue(null);

      await expect(
        citasService.cambiarEstado(99, 2, { estado: "en_curso" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("debe lanzar ForbiddenException si el medico no es el asignado", async () => {
      mockPrismaService.cita.findUnique.mockResolvedValue({
        id: 1,
        estado: "pendiente",
        id_medico: 2,
        id_paciente: 1,
      });

      await expect(
        citasService.cambiarEstado(1, 99, { estado: "en_curso" }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});