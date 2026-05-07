import { IsString, IsOptional, IsDateString, MaxLength } from "class-validator";

export class CrearPacienteDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(150)
  apellidos: string;

  @IsString()
  @MaxLength(20)
  dni: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;
}
