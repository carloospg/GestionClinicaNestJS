import {
  IsInt,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CrearCitaDto {
  @IsInt()
  id_paciente: number;

  @IsInt()
  id_medico: number;

  @IsDateString()
  fecha_hora: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}
