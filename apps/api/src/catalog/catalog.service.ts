import { Injectable } from '@nestjs/common';
import type { CatalogQuery } from '@travelos/shared';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AuthenticatedUser, query: CatalogQuery) {
    return this.prisma.catalogItem.findMany({
      where: {
        agencyId: user.agencyId,
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.destination
          ? {
              destination: {
                contains: query.destination,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      orderBy: [{ kind: 'asc' }, { destination: 'asc' }, { name: 'asc' }],
    });
  }
}
