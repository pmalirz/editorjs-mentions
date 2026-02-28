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
 * Checks if a URL is safe to use in href or src attributes.
 * Allows only whitelisted protocols.
 */
export function isValidUrl(url: string): boolean {
  if (!url) return false;
  // Remove whitespace and control characters to prevent bypasses
  // eslint-disable-next-line no-control-regex
  const normalized = url.replace(/[\s\x00-\x1F]/g, "").toLowerCase();

  // Allow relative URLs starting with / but not // (protocol-relative) to avoid cross-domain issues
  // Also allow anchors (#)
  if ((normalized.startsWith("/") && !normalized.startsWith("//")) || normalized.startsWith("#")) {
    return true;
  }

  const allowedProtocols = ["http:", "https:", "mailto:", "tel:", "mention:"];
  return allowedProtocols.some((protocol) => normalized.startsWith(protocol));
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
      if (attr.name === "href" || attr.name === "src") {
        if (!isValidUrl(attr.value)) {
          attrsToRemove.push(attr.name);
        }
      }
    }
    attrsToRemove.forEach((attr) => el.removeAttribute(attr));
  }

  return doc.body.innerHTML;
}
