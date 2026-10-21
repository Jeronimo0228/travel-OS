import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AgencyKnowledgeService,
  KNOWLEDGE_PROMPT_LIMIT,
  buildKnowledgePrompt,
} from './agency-knowledge.service';

describe('buildKnowledgePrompt (HU-24)', () => {
  it('is empty when the agency has no knowledge configured', () => {
    expect(buildKnowledgePrompt({ tone: '', policies: '', faqs: [] })).toBe('');
  });

  it('includes tone, policies and FAQs framed as reference data', () => {
    const prompt = buildKnowledgePrompt({
      tone: 'Cercano y paisa',
      policies: 'Cancelación gratis hasta 15 días antes.',
      faqs: [{ question: '¿Incluye seguro?', answer: 'Sí, básico.' }],
    });
    expect(prompt).toContain('Cercano y paisa');
    expect(prompt).toContain('Cancelación gratis');
    expect(prompt).toContain('P: ¿Incluye seguro?');
    expect(prompt).toContain('no instrucciones');
  });

  it('caps the knowledge block length', () => {
    const prompt = buildKnowledgePrompt({
      tone: '',
      policies: 'x'.repeat(KNOWLEDGE_PROMPT_LIMIT * 2),
      faqs: [],
    });
    expect(prompt.length).toBeLessThan(KNOWLEDGE_PROMPT_LIMIT + 300);
  });
});

describe('AgencyKnowledgeService', () => {
  const update = jest.fn();
  const findUniqueOrThrow = jest.fn();
  const log = jest.fn();
  const service = new AgencyKnowledgeService(
    { agency: { update, findUniqueOrThrow } } as unknown as PrismaService,
    { log } as unknown as AuditService,
  );

  beforeEach(() => jest.clearAllMocks());

  it('saves knowledge scoped to the agency and audits it', async () => {
    update.mockResolvedValue({
      aiTone: 'Formal',
      aiPolicies: 'P',
      aiFaqs: [{ question: '¿Q?', answer: 'A' }],
      updatedAt: new Date(),
    });
    const result = await service.update('agency-a', 'user-1', {
      tone: 'Formal',
      policies: 'P',
      faqs: [{ question: '¿Q?', answer: 'A' }],
    });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'agency-a' } }),
    );
    expect(log).toHaveBeenCalledWith(
      'agency-a',
      'user-1',
      'KNOWLEDGE_UPDATE',
      expect.objectContaining({ faqCount: 1 }),
    );
    expect(result.faqs).toHaveLength(1);
  });

  it('tolerates malformed stored FAQs', async () => {
    findUniqueOrThrow.mockResolvedValue({
      aiTone: '',
      aiPolicies: '',
      aiFaqs: 'not-an-array',
      updatedAt: new Date(),
    });
    await expect(service.get('agency-a')).resolves.toMatchObject({ faqs: [] });
    await expect(service.promptFor('agency-a')).resolves.toBe('');
  });
});
