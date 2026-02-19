import { escapeHtml, mentionIdFromHref, readMentionItemFromElement } from '../src/utils';

describe('utils', () => {
  describe('escapeHtml', () => {
    it('escapes special characters', () => {
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
      expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(escapeHtml("'single'")).toBe('&#39;single&#39;');
      expect(escapeHtml('&')).toBe('&amp;');
    });
  });

  describe('mentionIdFromHref', () => {
    it('extracts ID from mention:// URI', () => {
      expect(mentionIdFromHref('mention://u-123')).toBe('u-123');
    });

    it('decodes ID', () => {
      expect(mentionIdFromHref('mention://foo%20bar')).toBe('foo bar');
    });

    it('returns undefined for invalid URI', () => {
      expect(mentionIdFromHref('https://google.com')).toBeUndefined();
      expect(mentionIdFromHref(null)).toBeUndefined();
    });
  });

  describe('readMentionItemFromElement', () => {
    it('reads from dataset.mentionPayload', () => {
      const el = document.createElement('a');
      const payload = { id: '1', displayName: 'Test', description: 'Desc' };
      el.dataset.mentionPayload = encodeURIComponent(JSON.stringify(payload));

      const result = readMentionItemFromElement(el);
      expect(result).toEqual(expect.objectContaining(payload));
    });

    it('reads from dataset attributes if payload missing', () => {
      const el = document.createElement('a');
      el.dataset.mentionId = '2';
      el.dataset.mentionDisplayName = 'User 2';
      el.dataset.mentionDescription = 'Description';

      const result = readMentionItemFromElement(el);
      expect(result).toEqual({
        id: '2',
        displayName: 'User 2',
        description: 'Description',
        image: undefined,
        link: undefined
      });
    });

    it('infers from href and text content', () => {
      const el = document.createElement('a');
      el.href = 'mention://user-3';
      el.textContent = '@User 3';

      const result = readMentionItemFromElement(el);
      expect(result).toEqual({
        id: 'user-3',
        displayName: 'User 3',
        description: undefined,
        image: undefined,
        link: undefined
      });
    });
  });
});
