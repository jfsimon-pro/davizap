import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export async function createDefaultAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@gmail.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Jesus', 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: 'Default Tenant',
      },
    });

    await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'ADMIN',
        tenantId: tenant.id,
      },
    });
  }
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
