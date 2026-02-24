/**
 * Escapes special characters in a string for safe usage in HTML.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Escapes special characters in a string for safe usage in HTML attributes.
 */
export function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/`/g, "&#96;");
}

/**
 * Sanitizes HTML string by removing dangerous tags and attributes.
 * Uses DOMParser to parse and traverse the HTML.
 */
export function sanitizeHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const removeTags = ["script", "iframe", "object", "embed", "link", "style", "meta"];
  removeTags.forEach((tag) => {
    const elements = doc.querySelectorAll(tag);
    elements.forEach((el) => el.remove());
  });

  const all = doc.querySelectorAll("*");
  for (const el of all) {
    const attrsToRemove: string[] = [];
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("on")) {
        attrsToRemove.push(attr.name);
      }
      if (
        (attr.name === "href" || attr.name === "src") &&
        attr.value.trim().toLowerCase().startsWith("javascript:")
      ) {
        attrsToRemove.push(attr.name);
      }
    }
    attrsToRemove.forEach((attr) => el.removeAttribute(attr));
  }

  return doc.body.innerHTML;
}
