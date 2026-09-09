import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { LoginInput, RegisterAgencyInput } from '@travelos/shared';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { BCRYPT_SALT_ROUNDS } from './auth.constants';

type SafeUser = Pick<User, 'id' | 'agencyId' | 'email' | 'name' | 'role'>;

interface AuthResult {
  accessToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  async registerAgency(input: RegisterAgencyInput): Promise<AuthResult> {
    const existingUser = await this.prisma.user.findFirst({
      where: { email: input.adminEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(
      input.adminPassword,
      BCRYPT_SALT_ROUNDS,
    );

    try {
      const user = await this.prisma.$transaction(async (transaction) => {
        const agency = await transaction.agency.create({
          data: {
            name: input.agencyName,
            nit: input.nit,
            slug: input.slug,
          },
        });

        return transaction.user.create({
          data: {
            agencyId: agency.id,
            email: input.adminEmail,
            name: input.adminName,
            passwordHash,
            role: Role.ADMIN,
          },
        });
      });

      return this.createAuthResult(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Agency NIT or slug is already registered');
      }

      throw error;
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.prisma.user.findFirst({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      try {
        await this.auditService.log(user.agencyId, user.id, 'LOGIN_FAIL');
      } catch {
        // Audit must never turn a credential failure into a 500.
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.auditService.log(user.agencyId, user.id, 'LOGIN_SUCCESS');
    return this.createAuthResult(user);
  }

  private async createAuthResult(user: User): Promise<AuthResult> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      agencyId: user.agencyId,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        agencyId: user.agencyId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
