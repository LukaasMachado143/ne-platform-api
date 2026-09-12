import { UserStatus } from '@prisma/client';

export interface CreateUserInput {
  organizationId: string;
  name: string;
  displayName: string;
  email: string;
  roleId: string;
}

export interface UpdateUserBasicDataInput {
  name?: string;
  displayName?: string;
  email?: string;
}

export type ChangeUserStatusInput = UserStatus;
