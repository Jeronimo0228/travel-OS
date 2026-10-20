import { CatalogKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { seedCatalogForAgency } from '../../prisma/seed-catalog';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  it('filters catalog items by the authenticated agency and requested facets', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const service = new CatalogService({
      catalogItem: { findMany },
    } as unknown as PrismaService);
    const user = {
      id: 'advisor-a',
      agencyId: 'agency-a',
      role: 'ASESOR',
    } as AuthenticatedUser;

    await service.list(user, {
      kind: CatalogKind.HOTEL,
      destination: 'Cartagena',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        agencyId: 'agency-a',
        kind: CatalogKind.HOTEL,
        destination: { contains: 'Cartagena', mode: 'insensitive' },
      },
      orderBy: [{ kind: 'asc' }, { destination: 'asc' }, { name: 'asc' }],
    });
  });

  it('seeds the same idempotent inventory under the requested agency', async () => {
    const createMany = jest.fn().mockResolvedValue({ count: 10 });
    const database = { catalogItem: { createMany } };

    await seedCatalogForAgency(database, 'agency-a');

    const [input] = createMany.mock.calls[0] as [
      {
        data: Array<{ agencyId: string; slug: string }>;
        skipDuplicates: boolean;
      },
    ];
    expect(input.data).toHaveLength(26);
    expect(input.data.every((item) => item.agencyId === 'agency-a')).toBe(true);
    expect(input.skipDuplicates).toBe(true);
  });
});
