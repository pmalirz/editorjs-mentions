import { sanitizeHtml, isValidUrl } from "../src/utils";

describe("isValidUrl", () => {
  test("allows valid http/https urls", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  test("allows valid mailto/tel urls", () => {
    expect(isValidUrl("mailto:test@example.com")).toBe(true);
    expect(isValidUrl("tel:+123456789")).toBe(true);
  });

  test("allows relative urls", () => {
    expect(isValidUrl("/foo/bar")).toBe(true);
    expect(isValidUrl("foo/bar")).toBe(true);
    expect(isValidUrl("../foo")).toBe(true);
    expect(isValidUrl("#foo")).toBe(true);
  });

  test("rejects javascript:", () => {
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isValidUrl("  javascript:alert(1)")).toBe(false);
  });

  test("rejects control characters", () => {
    expect(isValidUrl("javascript\u0000:alert(1)")).toBe(false);
    expect(isValidUrl("\x00javascript:alert(1)")).toBe(false);
  });

  test("respects allowed protocols", () => {
    expect(isValidUrl("data:image/png", ["data:"])).toBe(true);
    expect(isValidUrl("http://example.com", ["data:"])).toBe(false);
  });

  test("rejects data: by default", () => {
    expect(isValidUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
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

  test("removes javascript: src", () => {
    const input = '<img src="javascript:alert(1)" />';
    expect(sanitizeHtml(input)).toBe('<img>');
  });

  test("allows safe hrefs", () => {
    const input = '<a href="https://example.com">Link</a>';
    expect(sanitizeHtml(input)).toBe('<a href="https://example.com">Link</a>');
  });

  test("allows safe src", () => {
    const input = '<img src="https://example.com/image.png" />';
    expect(sanitizeHtml(input)).toBe('<img src="https://example.com/image.png">');
  });

  test("allows relative hrefs", () => {
    const input = '<a href="/local/path">Link</a>';
    expect(sanitizeHtml(input)).toBe('<a href="/local/path">Link</a>');
  });

  test("allows mention: protocol", () => {
    const input = '<a href="mention://u-123">Link</a>';
    expect(sanitizeHtml(input)).toBe('<a href="mention://u-123">Link</a>');
  });

  test("keeps safe content", () => {
    const input = '<div class="foo"><b>Bold</b></div>';
    expect(sanitizeHtml(input)).toBe('<div class="foo"><b>Bold</b></div>');
  });
});
