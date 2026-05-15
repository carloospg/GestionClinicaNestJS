import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException, ConflictException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let authService: AuthService;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("test-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // test del login

  describe("login", () => {
    it("debe devolver token y usuario con credenciales correctas", async () => {
      const hash = await bcrypt.hash("admin1234", 10);

      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 1,
        nombre: "Admin",
        email: "admin@admin.com",
        password: hash,
        rol: "admin",
      });

      const resultado = await authService.login({
        email: "admin@admin.com",
        password: "admin1234",
      });

      expect(resultado.ok).toBe(true);
      expect(resultado.token).toBe("test-token");
      expect(resultado.usuario.email).toBe("admin@admin.com");
      expect(resultado.usuario.rol).toBe("admin");
    });

    it("debe lanzar UnauthorizedException si el usuario no existe", async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "noexiste@test.com",
          password: "1234",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("debe lanzar UnauthorizedException si la contraseña es incorrecta", async () => {
      const hash = await bcrypt.hash("passwordcorrecta", 10);

      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 1,
        nombre: "Admin",
        email: "admin@admin.com",
        password: hash,
        rol: "admin",
      });

      await expect(
        authService.login({
          email: "admin@admin.com",
          password: "passwordincorrecta",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // test del registro

  describe("registro", () => {
    it("debe crear un usuario correctamente", async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.usuario.create.mockResolvedValue({
        id: 2,
        nombre: "Medico Test",
        email: "medico@test.com",
        rol: "medico",
      });

      const resultado = await authService.registro({
        nombre: "Medico Test",
        email: "medico@test.com",
        password: "medico1234",
        rol: "medico",
      });

      expect(resultado.ok).toBe(true);
      expect(resultado.usuario.email).toBe("medico@test.com");
      expect(resultado.usuario.rol).toBe("medico");
    });

    it("debe lanzar ConflictException si el email ya existe", async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 1,
        email: "medico@test.com",
      });

      await expect(
        authService.registro({
          nombre: "Medico Test",
          email: "medico@test.com",
          password: "medico1234",
          rol: "medico",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("debe lanzar ConflictException si se intenta crear un admin", async () => {
      await expect(
        authService.registro({
          nombre: "Admin Test",
          email: "admin2@test.com",
          password: "admin1234",
          rol: "admin",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
