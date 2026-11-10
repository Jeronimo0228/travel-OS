import { catalogItemsFromCsv, parseCsv } from './catalog-csv';
import { slugify } from './catalog.service';

const HEADER = 'tipo,nombre,destino,descripcion,unidad,precio,moneda';

describe('catalog CSV import (HU-34)', () => {
  it('parsea comillas, comas internas y punto y coma', () => {
    expect(parseCsv('a,"b, c","d ""e"""\n1;2;3')).toEqual([
      ['a', 'b, c', 'd "e"'],
      ['1', '2', '3'],
    ]);
  });

  it('convierte filas válidas en ítems del catálogo', () => {
    const { items, errors } = catalogItemsFromCsv(
      `${HEADER}\nHotel,Hotel Caribe,Cartagena,"Frente al mar, desayuno",noche,"$450.000",COP\nactividad,Tour islas,Cartagena,,persona,180000,`,
    );
    expect(errors).toEqual([]);
    expect(items).toEqual([
      expect.objectContaining({
        kind: 'HOTEL',
        pricingUnit: 'PER_NIGHT',
        price: 450000,
        currency: 'COP',
      }),
      expect.objectContaining({
        kind: 'ACTIVITY',
        pricingUnit: 'PER_PERSON',
        price: 180000,
        description: '',
      }),
    ]);
  });

  it('reporta cada fila con error y su número', () => {
    const { errors } = catalogItemsFromCsv(
      `${HEADER}\ncrucero,X,Y,,noche,1,\nhotel,Ok,Medellín,,semana,1,\nhotel,Precio,Medellín,,noche,-5,`,
    );
    expect(errors.map((e) => e.row)).toEqual([2, 3, 4]);
  });

  it('exige el encabezado y limita a 200 filas', () => {
    expect(catalogItemsFromCsv('nombre,precio\nA,1').errors[0].message).toMatch(
      /Faltan columnas/,
    );
    const many = Array.from(
      { length: 201 },
      (_, i) => `hotel,H${i},Cali,,noche,1,`,
    ).join('\n');
    expect(catalogItemsFromCsv(`${HEADER}\n${many}`).errors[0].message).toMatch(
      /Máximo 200/,
    );
  });

  it('genera slugs sin tildes', () => {
    expect(slugify('Hotel Ñandú — Bogotá')).toBe('hotel-nandu-bogota');
  });
});
