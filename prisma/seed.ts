import {
  OrganizationStatus,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const organization = await prisma.organization.upsert({
    where: { slug: 'ne-bartenders' },
    update: {
      name: 'N&E Bartenders',
      status: OrganizationStatus.ACTIVE,
    },
    create: {
      name: 'N&E Bartenders',
      slug: 'ne-bartenders',
      status: OrganizationStatus.ACTIVE,
    },
  });

  await prisma.$transaction([
    prisma.role.upsert({
      where: {
        organizationId_key: {
          organizationId: organization.id,
          key: 'ADMIN',
        },
      },
      update: { name: 'Administrador' },
      create: {
        organizationId: organization.id,
        key: 'ADMIN',
        name: 'Administrador',
      },
    }),
    prisma.role.upsert({
      where: {
        organizationId_key: {
          organizationId: organization.id,
          key: 'OPERATIONAL_LEADER',
        },
      },
      update: { name: 'Líder Operacional' },
      create: {
        organizationId: organization.id,
        key: 'OPERATIONAL_LEADER',
        name: 'Líder Operacional',
      },
    }),
  ]);
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
