import { escapeHtml, escapeAttr } from "../src/utils";

describe("utils", () => {
  describe("escapeHtml", () => {
    it("should escape special characters", () => {
      const input = '<div class="test">\'&</div>';
      const expected = "&lt;div class=&quot;test&quot;&gt;&#39;&amp;&lt;/div&gt;";
      expect(escapeHtml(input)).toBe(expected);
    });

    it("should return the same string if no special characters are present", () => {
      const input = "Hello World";
      expect(escapeHtml(input)).toBe(input);
    });
  });

  describe("escapeAttr", () => {
    it("should escape special characters including backticks", () => {
      const input = '`test`';
      const expected = "&#96;test&#96;";
      expect(escapeAttr(input)).toBe(expected);
    });

    it("should also escape HTML special characters", () => {
      const input = '<"&>';
      const expected = "&lt;&quot;&amp;&gt;";
      expect(escapeAttr(input)).toBe(expected);
    });
  });
});
