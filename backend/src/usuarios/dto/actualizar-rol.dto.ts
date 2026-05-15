import { IsEnum } from "class-validator";
import { Rol } from "@prisma/client";

export class ActualizarRolDto {
    @IsEnum(Rol)
    rol: Rol;
}