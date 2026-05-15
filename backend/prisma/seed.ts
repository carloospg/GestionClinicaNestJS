import process from 'process';
try { process.loadEnvFile();} catch(e){}

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/es';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {

  // Admin
  const existeAdmin = await prisma.usuario.findUnique({
    where: { email: 'admin@admin.com' },
  });

  if (!existeAdmin) {
    const hash = await bcrypt.hash('admin1234', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'Admin',
        email: 'admin@admin.com',
        password: hash,
        rol: 'admin',
      },
    });
    console.log('Admin creado');
  } else {
    console.log('Admin ya existe');
  }

  // 5 mwdicos
  const medicos: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const email = `medico${i}@clinica.com`;
    const existe = await prisma.usuario.findUnique({ where: { email } });

    if (!existe) {
      const hash = await bcrypt.hash('medico1234', 10);
      const medico = await prisma.usuario.create({
        data: {
          nombre: faker.person.fullName(),
          email,
          password: hash,
          rol: 'medico',
        },
      });
      medicos.push(medico);
      console.log(`Médico ${i} creado: ${email}`);
    } else {
      medicos.push(existe);
      console.log(`Médico ${i} ya existe`);
    }
  }

  // 5 recepcionistas
  for (let i = 1; i <= 5; i++) {
    const email = `recepcionista${i}@clinica.com`;
    const existe = await prisma.usuario.findUnique({ where: { email } });

    if (!existe) {
      const hash = await bcrypt.hash('recep1234', 10);
      await prisma.usuario.create({
        data: {
          nombre: faker.person.fullName(),
          email,
          password: hash,
          rol: 'recepcionista',
        },
      });
      console.log(`Recepcionista ${i} creada: ${email}`);
    } else {
      console.log(`Recepcionista ${i} ya existe`);
    }
  }

  // 5 pacientes de prueba
  const pacientes: any[] = [];
  const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

  for (let i = 1; i <= 5; i++) {
    const num = String(i).padStart(8, '0');
    const dni = num + LETRAS_DNI[parseInt(num) % 23];
    const existe = await prisma.paciente.findUnique({ where: { dni } });

    if (!existe) {
      const paciente = await prisma.paciente.create({
        data: {
          nombre: faker.person.firstName(),
          apellidos: faker.person.lastName() + ' ' + faker.person.lastName(),
          dni,
          telefono: faker.phone.number(),
          fecha_nacimiento: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }),
        },
      });
      pacientes.push(paciente);
      console.log(`Paciente ${i} creado: ${dni}`);
    } else {
      pacientes.push(existe);
      console.log(`Paciente ${i} ya existe`);
    }
  }

  // 5 citas por médico
  for (const medico of medicos) {
    for (let i = 0; i < 5; i++) {
      const paciente = pacientes[i % pacientes.length];

      const citaExiste = await prisma.cita.findFirst({
        where: { id_medico: medico.id, id_paciente: paciente.id },
      });

      if (!citaExiste) {
        await prisma.cita.create({
          data: {
            id_paciente: paciente.id,
            id_medico: medico.id,
            fecha_hora: faker.date.soon({ days: 30 }),
            motivo: faker.lorem.sentence(),
            estado: 'pendiente',
          },
        });
      }
    }
    console.log(`Citas creadas para médico: ${medico.email}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });