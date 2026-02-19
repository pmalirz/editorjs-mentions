import { encodeMentionsInOutput, decodeMentionsInOutput, encodeMentionsFromHtml, decodeMentionsToHtml } from '../src/serialization';
import type { EditorJSOutputLike, MentionEntity } from '../src/types';

describe('serialization', () => {
  const htmlWithMentions = `
    <p>Hello
    <a class="editorjs-mention" href="mention://u-1"
       data-mention-id="u-1"
       data-mention-display-name="User One"
       data-mention-description="First User"
       data-mention-trigger="@">@User One</a>
    and
    <a class="editorjs-mention" href="mention://u-2"
       data-mention-id="u-2"
       data-mention-display-name="User Two"
       data-mention-trigger="@">@User Two</a>
    </p>
  `;

  describe('encodeMentionsFromHtml', () => {
    it('extracts mentions from HTML', () => {
      const result = encodeMentionsFromHtml(htmlWithMentions);
      // The text content might have newlines/spaces depending on how JSDOM parses the input string with newlines.
      // We'll normalize spaces for check
      const normalizedText = result.text.replace(/\s+/g, ' ').trim();
      expect(normalizedText).toContain('Hello @User One and @User Two');

      expect(result.entities).toHaveLength(2);
      expect(result.entities[0]).toMatchObject({
        type: 'mention',
        id: 'u-1',
        displayName: 'User One'
      });
      expect(result.entities[1]).toMatchObject({
        type: 'mention',
        id: 'u-2',
        displayName: 'User Two'
      });
    });
  });

  describe('decodeMentionsToHtml', () => {
    it('restores mentions to HTML', () => {
      const text = 'Hello @User One and @User Two';
      const entities: MentionEntity[] = [
        {
          type: 'mention',
          id: 'u-1',
          displayName: 'User One',
          start: 6,
          end: 15,
          trigger: '@',
          description: 'First User'
        },
        {
          type: 'mention',
          id: 'u-2',
          displayName: 'User Two',
          start: 20,
          end: 29,
          trigger: '@'
        }
      ];

      const html = decodeMentionsToHtml(text, entities);
      expect(html).toContain('Hello <a class="editorjs-mention"');
      expect(html).toContain('href="mention://u-1"');
      expect(html).toContain('href="mention://u-2"');
      expect(html).toContain('data-mention-display-name="User One"');
    });
  });

  describe('encodeMentionsInOutput', () => {
    it('processes EditorJS blocks', () => {
      const outputWithHtml: EditorJSOutputLike = {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Hi <a class="editorjs-mention" href="mention://test" data-mention-id="test" data-mention-display-name="Test User">@Test User</a>'
            }
          }
        ]
      };

      const result = encodeMentionsInOutput(outputWithHtml);
      expect(result.blocks[0].data.text).toBe('Hi @Test User');
      expect(result.blocks[0].data.entities).toBeDefined();
      expect((result.blocks[0].data.entities as any[])[0].id).toBe('test');
    });
  });

  describe('decodeMentionsInOutput', () => {
      it('restores HTML in EditorJS blocks', () => {
          const input: EditorJSOutputLike = {
              blocks: [
                  {
                      type: 'paragraph',
                      data: {
                          text: 'Hi @Test User',
                          entities: [
                              {
                                  type: 'mention',
                                  id: 'test',
                                  displayName: 'Test User',
                                  start: 3,
                                  end: 13,
                                  trigger: '@'
                              }
                          ]
                      }
                  }
              ]
          };

          const result = decodeMentionsInOutput(input);
          expect(result.blocks[0].data.text).toContain('href="mention://test"');
      });
  });
});
