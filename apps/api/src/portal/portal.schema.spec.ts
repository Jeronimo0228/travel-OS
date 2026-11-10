import {
  createItineraryItemSchema,
  createReservationDocumentSchema,
  documentUploadLimits,
  updateItineraryItemSchema,
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

  describe('updateItineraryItemSchema', () => {
    it('accepts a partial update with only the changed fields', () => {
      expect(
        updateItineraryItemSchema.safeParse({ title: 'Nuevo' }).success,
      ).toBe(true);
      expect(updateItineraryItemSchema.safeParse({ position: 2 }).success).toBe(
        true,
      );
    });

    it('rejects an empty update', () => {
      expect(updateItineraryItemSchema.safeParse({}).success).toBe(false);
    });

    it('lets the client clear optional fields with null', () => {
      const parsed = updateItineraryItemSchema.safeParse({
        details: null,
        location: null,
        startsAt: null,
      });
      expect(parsed.success).toBe(true);
      expect(parsed.success && parsed.data).toEqual({
        details: null,
        location: null,
        startsAt: null,
      });
    });

    it('does not allow clearing the title', () => {
      expect(updateItineraryItemSchema.safeParse({ title: null }).success).toBe(
        false,
      );
      expect(
        updateItineraryItemSchema.safeParse({ title: '   ' }).success,
      ).toBe(false);
    });

    it('compares dates as instants when both are sent', () => {
      expect(
        updateItineraryItemSchema.safeParse({
          startsAt: '2026-10-20T12:00:00-05:00',
          endsAt: '2026-10-20T16:00:00Z',
        }).success,
      ).toBe(false);
    });
  });

  it('exposes the document upload limits the frontend also enforces', () => {
    expect(documentUploadLimits.maxBytes).toBe(4 * 1024 * 1024);
    expect(documentUploadLimits.contentTypes).toEqual([
      'application/pdf',
      'image/jpeg',
      'image/png',
    ]);
  });
});
