import { Module } from '@nestjs/common';
import { OrganizationsModule } from '../organizations/organizations.module';
import { RolesModule } from '../roles/roles.module';
import { UsersService } from './users.service';

@Module({
  imports: [OrganizationsModule, RolesModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
