import { encodeMentionsInOutput, decodeMentionsInOutput } from "../src/serialization";
import type { EditorJSOutputLike, MentionEntity } from "../src/types";

describe("serialization", () => {
  describe("encodeMentionsInOutput", () => {
    it("should encode mention anchors into entities", () => {
      const output: EditorJSOutputLike = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: 'Hello <a class="editorjs-mention" data-mention-id="123" data-mention-display-name="User">@User</a>!',
            },
          },
        ],
      };

      const result = encodeMentionsInOutput(output);
      const block = result.blocks[0];

      expect(block.data.text).toBe("Hello @User!");
      expect(block.data.entities).toBeDefined();
      const entities = block.data.entities as MentionEntity[];
      expect(entities).toHaveLength(1);
      expect(entities[0]).toEqual(expect.objectContaining({
        type: "mention",
        id: "123",
        displayName: "User",
        start: 6,
        end: 11,
      }));
    });

    it("should handle plain text without mentions", () => {
       const output: EditorJSOutputLike = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "Just some text.",
            },
          },
        ],
      };

      const result = encodeMentionsInOutput(output);
      expect(result.blocks[0].data.text).toBe("Just some text.");
      expect(result.blocks[0].data.entities).toBeUndefined();
    });
  });

  describe("decodeMentionsInOutput", () => {
    it("should decode entities back into mention anchors", () => {
      const output: EditorJSOutputLike = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "Hello @User!",
              entities: [
                {
                  type: "mention",
                  id: "123",
                  displayName: "User",
                  start: 6,
                  end: 11,
                  trigger: "@"
                },
              ],
            },
          },
        ],
      };

      const result = decodeMentionsInOutput(output);
      const text = result.blocks[0].data.text as string;

      expect(text).toContain('class="editorjs-mention"');
      expect(text).toContain('data-mention-id="123"');
      expect(text).toContain('data-mention-display-name="User"');
      expect(text).toContain('>@User</a>');
      expect(text).toContain('Hello ');
      expect(text).toContain('!');
    });

    it("should handle overlapping or out of bounds entities gracefully", () => {
       const output: EditorJSOutputLike = {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "Short",
              entities: [
                {
                  type: "mention",
                  id: "123",
                  displayName: "User",
                  start: 10, // Out of bounds
                  end: 15,
                },
              ],
            },
          },
        ],
      };

      const result = decodeMentionsInOutput(output);
      expect(result.blocks[0].data.text).toBe("Short");
    });
  });
});
