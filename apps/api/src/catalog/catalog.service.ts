import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type {
  CatalogAdminQuery,
  CatalogItemInput,
  CatalogQuery,
  UpdateCatalogItemInput,
} from '@travelos/shared';
import { AuditService } from '../audit/audit.service';
import type { AuthenticatedUser } from '../common/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { catalogItemsFromCsv } from './catalog-csv';

export function slugify(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'item'
  );
}

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit?: AuditService,
  ) {}

  /** Catálogo vigente (lo que usan el cotizador y la biblioteca del viaje). */
  list(user: AuthenticatedUser, query: CatalogQuery) {
    return this.prisma.catalogItem.findMany({
      where: {
        agencyId: user.agencyId,
        archivedAt: null,
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.destination
          ? {
              destination: { contains: query.destination, mode: 'insensitive' },
            }
          : {}),
      },
      orderBy: [{ kind: 'asc' }, { destination: 'asc' }, { name: 'asc' }],
    });
  }

  /** HU-34: vista del editor, opcionalmente con archivados. */
  listForEditor(user: AuthenticatedUser, query: CatalogAdminQuery) {
    return this.prisma.catalogItem.findMany({
      where: {
        agencyId: user.agencyId,
        ...(query.includeArchived === 'true' ? {} : { archivedAt: null }),
      },
      orderBy: [
        { archivedAt: { sort: 'asc', nulls: 'first' } },
        { destination: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async create(user: AuthenticatedUser, input: CatalogItemInput) {
    const item = await this.prisma.catalogItem.create({
      data: {
        ...input,
        agencyId: user.agencyId,
        slug: await this.uniqueSlug(user.agencyId, input.name),
      },
    });
    await this.audit?.log(user.agencyId, user.id, 'CATALOG_CREATE', {
      itemId: item.id,
    });
    return item;
  }

  async update(
    user: AuthenticatedUser,
    id: string,
    input: UpdateCatalogItemInput,
  ) {
    await this.findOwned(user, id);
    const item = await this.prisma.catalogItem.update({
      where: { id },
      data: input,
    });
    await this.audit?.log(user.agencyId, user.id, 'CATALOG_UPDATE', {
      itemId: id,
    });
    return item;
  }

  /** Archivar no borra: las cotizaciones existentes conservan su ítem. */
  async setArchived(user: AuthenticatedUser, id: string, archived: boolean) {
    await this.findOwned(user, id);
    const item = await this.prisma.catalogItem.update({
      where: { id },
      data: { archivedAt: archived ? new Date() : null },
    });
    await this.audit?.log(user.agencyId, user.id, 'CATALOG_ARCHIVE', {
      itemId: id,
      archived,
    });
    return item;
  }

  /** Todo o nada: si una fila tiene error, no se guarda ninguna. */
  async importCsv(user: AuthenticatedUser, csv: string) {
    const { items, errors } = catalogItemsFromCsv(csv);
    if (errors.length) {
      throw new BadRequestException({
        message: 'El archivo tiene errores. No se importó nada.',
        errors,
      });
    }
    const created = await this.prisma.$transaction(async (tx) => {
      const taken = new Set(
        (
          await tx.catalogItem.findMany({
            where: { agencyId: user.agencyId },
            select: { slug: true },
          })
        ).map((row) => row.slug),
      );
      const data: Prisma.CatalogItemCreateManyInput[] = items.map((item) => {
        const base = slugify(`${item.name}-${item.destination}`);
        let slug = base;
        for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
        taken.add(slug);
        return { ...item, agencyId: user.agencyId, slug };
      });
      return tx.catalogItem.createMany({ data });
    });
    await this.audit?.log(user.agencyId, user.id, 'CATALOG_IMPORT', {
      created: created.count,
    });
    return { created: created.count };
  }

  private async findOwned(user: AuthenticatedUser, id: string) {
    const item = await this.prisma.catalogItem.findFirst({
      where: { id, agencyId: user.agencyId },
      select: { id: true },
    });
    if (!item) throw new NotFoundException('Catalog item not found');
    return item;
  }

  private async uniqueSlug(agencyId: string, name: string) {
    const base = slugify(name);
    const existing = await this.prisma.catalogItem.findMany({
      where: { agencyId, slug: { startsWith: base } },
      select: { slug: true },
    });
    const taken = new Set(existing.map((row) => row.slug));
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    return slug;
  }
}
