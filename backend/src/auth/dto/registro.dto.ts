import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { Rol } from "@prisma/client";

export class RegistroDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsEnum(Rol)
  rol: Rol;
}
