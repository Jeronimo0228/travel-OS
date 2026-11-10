import {
  CATALOG_CSV_COLUMNS,
  CATALOG_IMPORT_MAX_ROWS,
  catalogItemInputSchema,
  type CatalogItemInput,
} from '@travelos/shared';

/** Parser CSV (RFC 4180): comillas dobles, comas y saltos de línea dentro de comillas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const BOM = String.fromCharCode(0xfeff);
  const input = text.startsWith(BOM) ? text.slice(1) : text;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') quoted = false;
      else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ',' || char === ';') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

const KIND: Record<string, 'HOTEL' | 'ACTIVITY'> = {
  hotel: 'HOTEL',
  alojamiento: 'HOTEL',
  actividad: 'ACTIVITY',
  activity: 'ACTIVITY',
  tour: 'ACTIVITY',
};
const UNIT: Record<string, 'PER_NIGHT' | 'PER_PERSON'> = {
  noche: 'PER_NIGHT',
  'por noche': 'PER_NIGHT',
  per_night: 'PER_NIGHT',
  persona: 'PER_PERSON',
  'por persona': 'PER_PERSON',
  per_person: 'PER_PERSON',
};

export interface CsvRowError {
  row: number;
  message: string;
}

/** Convierte el CSV en ítems validados. Devuelve todos los errores por fila. */
export function catalogItemsFromCsv(text: string): {
  items: CatalogItemInput[];
  errors: CsvRowError[];
} {
  const rows = parseCsv(text);
  const errors: CsvRowError[] = [];
  if (rows.length < 2) {
    return {
      items: [],
      errors: [{ row: 1, message: 'El archivo no tiene filas de datos.' }],
    };
  }
  const header = rows[0].map((cell) =>
    cell
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, ''),
  );
  const missing = CATALOG_CSV_COLUMNS.filter(
    (column) =>
      column !== 'moneda' &&
      column !== 'descripcion' &&
      !header.includes(column),
  );
  if (missing.length) {
    return {
      items: [],
      errors: [{ row: 1, message: `Faltan columnas: ${missing.join(', ')}.` }],
    };
  }
  const data = rows.slice(1);
  if (data.length > CATALOG_IMPORT_MAX_ROWS) {
    return {
      items: [],
      errors: [
        {
          row: 1,
          message: `Máximo ${CATALOG_IMPORT_MAX_ROWS} filas por importación.`,
        },
      ],
    };
  }
  const col = (cells: string[], name: string) =>
    (cells[header.indexOf(name)] ?? '').trim();
  const items: CatalogItemInput[] = [];
  data.forEach((cells, index) => {
    const rowNumber = index + 2;
    const kind = KIND[col(cells, 'tipo').toLowerCase()];
    const pricingUnit = UNIT[col(cells, 'unidad').toLowerCase()];
    const price = Number(
      col(cells, 'precio')
        .replace(/[$\s.]/g, '')
        .replace(',', '.'),
    );
    const parsed = catalogItemInputSchema.safeParse({
      kind,
      name: col(cells, 'nombre'),
      destination: col(cells, 'destino'),
      description: col(cells, 'descripcion'),
      pricingUnit,
      price,
      currency: col(cells, 'moneda') || 'COP',
    });
    if (!kind)
      errors.push({
        row: rowNumber,
        message: 'tipo debe ser «hotel» o «actividad».',
      });
    else if (!pricingUnit)
      errors.push({
        row: rowNumber,
        message: 'unidad debe ser «noche» o «persona».',
      });
    else if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push({
        row: rowNumber,
        message: `${issue.path.join('.') || 'fila'}: ${issue.message}`,
      });
    } else items.push(parsed.data);
  });
  return { items, errors };
}
