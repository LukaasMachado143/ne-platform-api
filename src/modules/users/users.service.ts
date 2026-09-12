import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationStatus, Prisma, User, UserStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { RolesService } from '../roles/roles.service';
import {
  ChangeUserStatusInput,
  CreateUserInput,
  UpdateUserBasicDataInput,
} from './users.types';

const VALID_STATUS_TRANSITIONS: Record<UserStatus, ReadonlySet<UserStatus>> = {
  [UserStatus.PENDING_ACTIVATION]: new Set([
    UserStatus.ACTIVE,
    UserStatus.INACTIVE,
  ]),
  [UserStatus.ACTIVE]: new Set([UserStatus.INACTIVE]),
  [UserStatus.INACTIVE]: new Set([UserStatus.ACTIVE]),
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationsService: OrganizationsService,
    private readonly rolesService: RolesService,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(organizationId: string, email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: normalizeEmail(email),
        },
      },
    });
  }

  async create(input: CreateUserInput): Promise<User> {
    const organization = await this.organizationsService.findById(
      input.organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.status !== OrganizationStatus.ACTIVE) {
      throw new BadRequestException('Organization must be active');
    }

    const role = await this.rolesService.findById(input.roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.organizationId !== input.organizationId) {
      throw new BadRequestException(
        'Role must belong to the same Organization as the User',
      );
    }

    const email = normalizeEmail(input.email);
    const existingUser = await this.findByEmail(input.organizationId, email);

    if (existingUser) {
      throw new ConflictException(
        'Email is already in use within this Organization',
      );
    }

    try {
      return await this.prisma.user.create({
        data: {
          organizationId: input.organizationId,
          name: input.name,
          displayName: input.displayName,
          email,
          roleId: input.roleId,
          status: UserStatus.PENDING_ACTIVATION,
        },
      });
    } catch (error: unknown) {
      this.handleUniqueEmailConflict(error);
      throw error;
    }
  }

  async updateBasicData(
    id: string,
    input: UpdateUserBasicDataInput,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { organizationId: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const email = input.email ? normalizeEmail(input.email) : undefined;

    if (email && email !== user.email) {
      const existingUser = await this.findByEmail(user.organizationId, email);

      if (existingUser) {
        throw new ConflictException(
          'Email is already in use within this Organization',
        );
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          name: input.name,
          displayName: input.displayName,
          email,
        },
      });
    } catch (error: unknown) {
      this.handleUniqueEmailConflict(error);
      throw error;
    }
  }

  async changeStatus(id: string, status: ChangeUserStatusInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!VALID_STATUS_TRANSITIONS[user.status].has(status)) {
      throw new BadRequestException(
        `Invalid User status transition: ${user.status} -> ${status}`,
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async changeRole(id: string, roleId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.rolesService.findById(roleId);

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.organizationId !== user.organizationId) {
      throw new BadRequestException(
        'Role must belong to the same Organization as the User',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: { roleId },
    });
  }

  private handleUniqueEmailConflict(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Email is already in use within this Organization',
      );
    }
  }
}
