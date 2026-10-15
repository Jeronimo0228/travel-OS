import { Prisma } from '@prisma/client';
import { renderQuotePdf } from './quote-pdf.renderer';

describe('renderQuotePdf', () => {
  it('renders the quote as a downloadable PDF document', async () => {
    const pdf = await renderQuotePdf({
      prompt: 'Viaje familiar a Cartagena',
      destination: 'Cartagena',
      durationDays: 4,
      travelerCount: 2,
      options: [
        {
          title: 'Centro histórico',
          summary: 'Hotel y recorrido guiado.',
          totalPrice: new Prisma.Decimal(1_160_000),
          currency: 'COP',
          items: [
            {
              nameSnapshot: 'Casa Amurallada',
              pricingUnit: 'PER_NIGHT',
              quantity: 3,
              unitPrice: new Prisma.Decimal(460_000),
            },
            {
              nameSnapshot: 'Islas del Rosario',
              pricingUnit: 'PER_PERSON',
              quantity: 2,
              unitPrice: new Prisma.Decimal(120_000),
            },
          ],
        },
      ],
    });

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(500);
  });
});
