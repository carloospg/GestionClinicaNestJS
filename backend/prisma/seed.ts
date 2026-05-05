import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // admin
  const existeAdmin = await prisma.usuario.findUnique({
    where: { email: 'admin@admin.com' },
  });

  if (!existeAdmin) {
    const hash = await bcrypt.hash('admin1234', 10);
    await prisma.usuario.create({
      data: {
        nombre: 'admin',
        email: 'admin@admin.com',
        password: hash,
        rol: 'admin',
      },
    });
    console.log('Usuario admin creado correctamente');
  } else {
    console.log('Usuario admin ya existe');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });