import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  Organization,
  OrganizationStatus,
  Role,
  User,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from './users.service';

const now = new Date('2026-01-01T00:00:00.000Z');
const organization: Organization = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'N&E Bartenders',
  slug: 'ne-bartenders',
  status: OrganizationStatus.ACTIVE,
  createdAt: now,
  updatedAt: now,
};
const role: Role = {
  id: '00000000-0000-0000-0000-000000000002',
  organizationId: organization.id,
  key: 'ADMIN',
  name: 'Administrador',
  description: null,
  createdAt: now,
  updatedAt: now,
};
const user: User = {
  id: '00000000-0000-0000-0000-000000000003',
  organizationId: organization.id,
  name: 'User Name',
  displayName: 'User',
  email: 'user@example.com',
  status: UserStatus.PENDING_ACTIVATION,
  roleId: role.id,
  createdAt: now,
  updatedAt: now,
};

describe('UsersService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const organizationsService = {
    findById: jest.fn(),
  };
  const rolesService = {
    findById: jest.fn(),
  };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    organizationsService.findById.mockResolvedValue(organization);
    rolesService.findById.mockResolvedValue(role);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(user);

    service = new UsersService(
      prisma as unknown as PrismaService,
      organizationsService as unknown as OrganizationsService,
      rolesService as unknown as RolesService,
    );
  });

  it('normalizes email and creates the User pending activation', async () => {
    await service.create({
      organizationId: organization.id,
      name: user.name,
      displayName: user.displayName,
      email: '  USER@Example.COM ',
      roleId: role.id,
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        organizationId: organization.id,
        name: user.name,
        displayName: user.displayName,
        email: 'user@example.com',
        roleId: role.id,
        status: UserStatus.PENDING_ACTIVATION,
      },
    });
  });

  it('rejects a duplicate email in the same Organization', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.create({
        organizationId: organization.id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        roleId: role.id,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects a Role from another Organization', async () => {
    rolesService.findById.mockResolvedValue({
      ...role,
      organizationId: '00000000-0000-0000-0000-000000000099',
    });

    await expect(
      service.create({
        organizationId: organization.id,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        roleId: role.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    [UserStatus.PENDING_ACTIVATION, UserStatus.ACTIVE],
    [UserStatus.PENDING_ACTIVATION, UserStatus.INACTIVE],
    [UserStatus.ACTIVE, UserStatus.INACTIVE],
    [UserStatus.INACTIVE, UserStatus.ACTIVE],
  ])('allows the status transition %s -> %s', async (current, next) => {
    prisma.user.findUnique.mockResolvedValue({ status: current });

    await service.changeStatus(user.id, next);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { status: next },
    });
  });

  it.each([
    [UserStatus.PENDING_ACTIVATION, UserStatus.PENDING_ACTIVATION],
    [UserStatus.ACTIVE, UserStatus.PENDING_ACTIVATION],
    [UserStatus.INACTIVE, UserStatus.PENDING_ACTIVATION],
  ])('rejects the status transition %s -> %s', async (current, next) => {
    prisma.user.findUnique.mockResolvedValue({ status: current });

    await expect(service.changeStatus(user.id, next)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
