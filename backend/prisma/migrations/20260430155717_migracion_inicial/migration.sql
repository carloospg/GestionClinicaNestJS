-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'medico', 'recepcionista');

-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('pendiente', 'en_curso', 'finalizada', 'cancelada');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paciente" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(150) NOT NULL,
    "dni" VARCHAR(20) NOT NULL,
    "telefono" VARCHAR(20),
    "fecha_nacimiento" DATE,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "fecha_inicio" TIMESTAMP(3),
    "estado" "EstadoCita" NOT NULL DEFAULT 'pendiente',
    "motivo" VARCHAR(255),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialClinico" (
    "id" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,

    CONSTRAINT "HistorialClinico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntradaHistorial" (
    "id" SERIAL NOT NULL,
    "id_historial" INTEGER NOT NULL,
    "id_medico" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" TEXT NOT NULL,
    "diagnostico" TEXT NOT NULL,
    "tratamiento" TEXT NOT NULL,

    CONSTRAINT "EntradaHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_key" ON "Paciente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "HistorialClinico_id_paciente_key" ON "HistorialClinico"("id_paciente");

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_id_medico_fkey" FOREIGN KEY ("id_medico") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistorialClinico" ADD CONSTRAINT "HistorialClinico_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntradaHistorial" ADD CONSTRAINT "EntradaHistorial_id_historial_fkey" FOREIGN KEY ("id_historial") REFERENCES "HistorialClinico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
