import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { id } });
  }

  findByKey(organizationId: string, key: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { organizationId_key: { organizationId, key } },
    });
  }
}
