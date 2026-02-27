import { escapeHtml, escapeAttr, isValidUrl } from "../src/utils";

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

  describe("isValidUrl", () => {
    it("should allow valid http/https URLs", () => {
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
    });

    it("should allow valid mailto/tel URLs", () => {
      expect(isValidUrl("mailto:user@example.com")).toBe(true);
      expect(isValidUrl("tel:+1234567890")).toBe(true);
    });

    it("should allow mention:// URLs", () => {
      expect(isValidUrl("mention://u-123")).toBe(true);
    });

    it("should allow relative URLs starting with /", () => {
      expect(isValidUrl("/path/to/resource")).toBe(true);
      expect(isValidUrl("/images/avatar.png")).toBe(true);
    });

    it("should reject protocol-relative URLs starting with //", () => {
      expect(isValidUrl("//example.com/script.js")).toBe(false);
    });

    it("should reject javascript: URLs", () => {
      expect(isValidUrl("javascript:alert(1)")).toBe(false);
      expect(isValidUrl("JAVASCRIPT:alert(1)")).toBe(false);
      // Control characters bypass attempt
      expect(isValidUrl("java\nscript:alert(1)")).toBe(false);
    });

    it("should reject vbscript: URLs", () => {
      expect(isValidUrl("vbscript:alert(1)")).toBe(false);
    });

    it("should reject unknown protocols", () => {
      expect(isValidUrl("ftp://example.com")).toBe(false);
      expect(isValidUrl("file:///etc/passwd")).toBe(false);
      expect(isValidUrl("data:text/html,bad")).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(isValidUrl("")).toBe(false);
    });
  });
});
