import PDFDocument from 'pdfkit';
import { Prisma } from '@prisma/client';

export interface QuotePdfContent {
  prompt: string;
  destination: string;
  durationDays: number;
  travelerCount: number;
  options: Array<{
    title: string;
    summary: string;
    totalPrice: Prisma.Decimal;
    currency: string;
    items: Array<{
      nameSnapshot: string;
      pricingUnit: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
    }>;
  }>;
}

export function renderQuotePdf(quote: QuotePdfContent): Promise<Buffer> {
  const document = new PDFDocument({ size: 'A4', margin: 48 });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    document.on('data', (chunk: Uint8Array) => chunks.push(Buffer.from(chunk)));
    document.once('error', reject);
    document.once('end', () => resolve(Buffer.concat(chunks)));

    document.fontSize(22).text('Cotización de viaje', { continued: false });
    document.moveDown(0.5);
    document.fontSize(11).text(`Destino: ${quote.destination}`);
    document.text(
      `Duración: ${quote.durationDays} días · Viajeros: ${quote.travelerCount}`,
    );
    document.moveDown(0.5);
    document.fontSize(10).text(`Solicitud: ${quote.prompt}`);
    document.moveDown();

    for (const [index, option] of quote.options.entries()) {
      document.fontSize(15).text(`${index + 1}. ${option.title}`);
      document.fontSize(10).text(option.summary);
      document.moveDown(0.25);

      for (const item of option.items) {
        document.text(
          `${item.nameSnapshot} · ${item.quantity} ${
            item.pricingUnit === 'PER_NIGHT' ? 'noches' : 'personas'
          } × ${item.unitPrice.toFixed(2)} ${option.currency}`,
        );
      }

      document
        .fontSize(12)
        .text(
          `Total estimado: ${option.totalPrice.toFixed(2)} ${option.currency}`,
        );
      document.moveDown();
    }

    document
      .fontSize(8)
      .text('Precios estimados sujetos a disponibilidad y confirmación.');
    document.end();
  });
}
