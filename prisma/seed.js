const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding TEMPO database...');

  // Create Registrar Admin
  const registrarPwd = await bcrypt.hash('Registrar123!', 10);
  const registrar = await prisma.user.upsert({
    where: { email: 'registrar@tempo.edu' },
    update: {},
    create: {
      email: 'registrar@tempo.edu',
      password: registrarPwd,
      role: 'REGISTRAR_ADMIN',
    },
  });

  // Create Finance Admin
  const financePwd = await bcrypt.hash('Finance123!', 10);
  const finance = await prisma.user.upsert({
    where: { email: 'finance@tempo.edu' },
    update: {},
    create: {
      email: 'finance@tempo.edu',
      password: financePwd,
      role: 'FINANCE_ADMIN',
    },
  });

  // Create Guidance Admin
  const guidancePwd = await bcrypt.hash('Guidance123!', 10);
  const guidance = await prisma.user.upsert({
    where: { email: 'guidance@tempo.edu' },
    update: {},
    create: {
      email: 'guidance@tempo.edu',
      password: guidancePwd,
      role: 'GUIDANCE_ADMIN',
    },
  });

  console.log('Created admin accounts:');
  console.log('- registrar@tempo.edu / Registrar123!');
  console.log('- finance@tempo.edu / Finance123!');
  console.log('- guidance@tempo.edu / Guidance123!');
  console.log('\nStudents can register through the web interface.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
