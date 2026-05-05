import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";
import { RegistroDto } from "./dto/registro.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedException("Email o contraseña incorrectos");
    }

    const valida = await bcrypt.compare(password, usuario.password);
    if (!valida) {
      throw new UnauthorizedException("Email o contrasena incorrectos");
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = this.jwtService.sign(payload);

    return {
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }

  async registro(registroDto: RegistroDto) {
    const { nombre, email, password, rol } = registroDto;

    if (rol === "admin") {
      throw new ConflictException("No se puede crear un usuario con rol admin");
    }

    const existe = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (existe) {
      throw new ConflictException("El usuario ya existe");
    }

    const hash = await bcrypt.hash(password, 10);

    const usuario = await this.prisma.usuario.create({
      data: { nombre, email, password: hash, rol },
    });

    return {
      ok: true,
      msg: "Usuario creado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}
