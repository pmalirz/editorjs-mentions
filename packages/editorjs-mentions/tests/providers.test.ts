import { createRestMentionProvider, normalizeProvider } from '../src/providers';
import type { MentionQuery } from '../src/types';

describe('providers', () => {
  describe('normalizeProvider', () => {
    it('returns the function if passed a function', () => {
      const fn = async () => [];
      expect(normalizeProvider(fn)).toBe(fn);
    });

    it('returns search method if passed an object', () => {
      const obj = { search: async () => [] };
      const normalized = normalizeProvider(obj);
      expect(typeof normalized).toBe('function');
    });
  });

  describe('createRestMentionProvider', () => {
    let originalFetch: typeof fetch;
    const mockFetch = jest.fn();

    beforeAll(() => {
      originalFetch = global.fetch;
      global.fetch = mockFetch;
    });

    afterAll(() => {
      global.fetch = originalFetch;
    });

    beforeEach(() => {
      mockFetch.mockReset();
    });

    it('fetches data with correct query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [{ id: '1', displayName: 'Test' }] })
      });

      const provider = createRestMentionProvider({
        endpoint: 'https://api.example.com/mentions'
      });

      const query: MentionQuery = { trigger: '@', query: 'te', limit: 10 };
      const result = await provider(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.example.com/mentions?query=te&trigger=%40&limit=10'),
        undefined
      );
      expect(result).toHaveLength(1);
      expect(result[0].displayName).toBe('Test');
    });

    it('handles custom query params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] })
      });

      const provider = createRestMentionProvider({
        endpoint: 'https://api.example.com/mentions',
        queryParam: 'q',
        triggerParam: 't',
        limitParam: 'l'
      });

      const query: MentionQuery = { trigger: '@', query: 'te', limit: 5 };
      await provider(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=te&t=%40&l=5'),
        undefined
      );
    });

    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      const provider = createRestMentionProvider({ endpoint: '/api' });
      await expect(provider({ trigger: '@', query: '', limit: 1 })).rejects.toThrow();
    });
  });
});
