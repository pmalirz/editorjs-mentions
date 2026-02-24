import { sanitizeHtml } from "../src/utils";

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

  test("keeps safe content", () => {
    const input = '<div class="foo"><b>Bold</b></div>';
    expect(sanitizeHtml(input)).toBe('<div class="foo"><b>Bold</b></div>');
  });
});
