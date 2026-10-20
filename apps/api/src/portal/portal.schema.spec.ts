import {
  createItineraryItemSchema,
  createReservationDocumentSchema,
} from '@travelos/shared';

describe('portal input schemas', () => {
  it('requires HTTPS document links without embedded credentials', () => {
    expect(
      createReservationDocumentSchema.safeParse({
        name: 'Voucher',
        url: 'https://files.example.test/voucher.pdf',
      }).success,
    ).toBe(true);
    expect(
      createReservationDocumentSchema.safeParse({
        name: 'Passport',
        url: 'http://files.example.test/passport.pdf',
      }).success,
    ).toBe(false);
    expect(
      createReservationDocumentSchema.safeParse({
        name: 'Passport',
        url: 'https://user:password@files.example.test/passport.pdf',
      }).success,
    ).toBe(false);
  });

  it('compares itinerary dates as instants, not ISO string order', () => {
    expect(
      createItineraryItemSchema.safeParse({
        title: 'Transfer',
        startsAt: '2026-10-20T12:00:00-05:00',
        endsAt: '2026-10-20T16:00:00Z',
      }).success,
    ).toBe(false);
  });
});
