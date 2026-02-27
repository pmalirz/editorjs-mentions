import { sanitizeHtml, isValidUrl } from "../src/utils";

describe("isValidUrl", () => {
  test("allows valid http/https URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  test("allows valid relative URLs", () => {
    expect(isValidUrl("/path/to/resource")).toBe(true);
    expect(isValidUrl("#anchor")).toBe(true);
  });

  test("rejects javascript: protocol", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isValidUrl("  javascript:alert(1)")).toBe(false);
    expect(isValidUrl("\njavascript:alert(1)")).toBe(false);
    // Control characters
    expect(isValidUrl("\x01javascript:alert(1)")).toBe(false);
  });

  test("rejects vbscript: protocol", () => {
    expect(isValidUrl("vbscript:msgbox(1)")).toBe(false);
  });

  test("allows other protocols", () => {
    expect(isValidUrl("mailto:user@example.com")).toBe(true);
    expect(isValidUrl("tel:+1234567890")).toBe(true);
  });
});

describe("sanitizeHtml", () => {
  test("removes script tags", () => {
    const input = '<div><script>alert(1)</script>Hello</div>';
    expect(sanitizeHtml(input)).toBe('<div>Hello</div>');
  });

  test("removes iframe tags", () => {
    const input = '<div><iframe src="x"></iframe>Hello</div>';
    expect(sanitizeHtml(input)).toBe('<div>Hello</div>');
  });

  test("removes on* attributes", () => {
    const input = '<div onclick="alert(1)">Hello</div>';
    expect(sanitizeHtml(input)).toBe('<div>Hello</div>');
  });

  test("removes javascript: links", () => {
    const input = '<a href="javascript:alert(1)">Link</a>';
    expect(sanitizeHtml(input)).toBe('<a>Link</a>');
  });

  test("removes obfuscated javascript: links", () => {
    const input = '<a href=" java\nscript:alert(1)">Link</a>';
    expect(sanitizeHtml(input)).toBe('<a>Link</a>');
  });

  test("keeps safe content", () => {
    const input = '<div class="foo"><b>Bold</b></div>';
    expect(sanitizeHtml(input)).toBe('<div class="foo"><b>Bold</b></div>');
  });
});
