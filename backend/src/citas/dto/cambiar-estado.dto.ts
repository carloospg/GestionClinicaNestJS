import { IsString, IsOptional, IsIn } from "class-validator";

export class CambiarEstadoDto {
  @IsString()
  @IsIn(["en_curso", "finalizada"])
  estado: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;
}
