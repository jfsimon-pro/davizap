import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar tenant padrão
  const tenant = await prisma.tenant.upsert({
    where: { id: 'default-tenant' },
    update: {},
    create: {
      id: 'default-tenant',
      name: 'Default Tenant',
    },
  });

  console.log(`✅ Tenant criado: ${tenant.name}`);

  // Hash da senha
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Criar usuário admin
  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@example.com',
      },
    },
    update: {},
    create: {
      id: 'admin-user',
      tenantId: tenant.id,
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    },
  });

  console.log(`✅ Usuário admin criado: ${adminUser.email}`);
  console.log(`   Senha: admin123 (MUDE ISSO EM PRODUÇÃO!)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✅ Seed concluído com sucesso!');
  })
  .catch(async (e) => {
    console.error('❌ Erro ao fazer seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
