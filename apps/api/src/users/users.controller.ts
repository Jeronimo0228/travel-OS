import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { changeUserRoleSchema } from '@travelos/shared';
import type { ChangeUserRoleInput } from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { CurrentUser } from '../common/current-user.decorator';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GERENTE)
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.list(user.agencyId);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  changeRole(
    @Param('id') userId: string,
    @Body(new ZodValidationPipe(changeUserRoleSchema))
    input: ChangeUserRoleInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.changeRole(
      user.agencyId,
      user.id,
      userId,
      input.role,
    );
  }
}
