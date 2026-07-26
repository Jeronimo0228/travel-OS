import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('TravelOS!demo1', 10);

  const agency = await prisma.agency.upsert({
    where: { slug: 'demo-agencia' },
    update: {},
    create: {
      name: 'Agencia Demo TravelOS',
      slug: 'demo-agencia',
      primaryColor: '#4648d4',
      users: {
        create: [
          {
            email: 'admin@demo.travelos.local',
            name: 'Admin Demo',
            role: Role.ADMIN,
            passwordHash,
          },
          {
            email: 'asesor@demo.travelos.local',
            name: 'Asesor Demo',
            role: Role.ASESOR,
            passwordHash,
          },
        ],
      },
    },
  });

  console.log('Seed OK agency:', agency.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
