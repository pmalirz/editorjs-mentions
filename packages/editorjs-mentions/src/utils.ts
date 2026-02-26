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
 * Checks if a URL is safe to use.
 *
 * @param url - The URL to check.
 * @param allowedProtocols - List of allowed protocols. Defaults to ["http:", "https:", "mailto:", "tel:"].
 * @returns True if the URL is valid and safe.
 */
export function isValidUrl(
  url: string,
  allowedProtocols: string[] = ["http:", "https:", "mailto:", "tel:"]
): boolean {
  if (!url) {
    return false;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return false;
  }

  // Basic control character check to prevent obfuscation
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F]/.test(trimmed)) {
    return false;
  }

  // Check if it starts with a scheme
  // A scheme is a sequence of characters beginning with a letter and followed by any combination of letters, digits, plus (+), period (.), or hyphen (-).
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9.+-]*):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase() + ":";
    return allowedProtocols.includes(scheme);
  }

  // No scheme, assume relative URL which is safe (unless it starts with // which is protocol-relative, but that resolves to http/https usually)
  // But strictly speaking, // could resolve to javascript: in some very old/weird contexts? No, // is network-path reference.
  return true;
}

/**
 * Sanitizes HTML string by removing dangerous tags and attributes.
 * Uses DOMParser to parse and traverse the HTML.
 */
export function sanitizeHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const removeTags = ["script", "iframe", "object", "embed", "link", "style", "meta", "base", "form"];
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
      if (attr.name === "href") {
        // Allow http, https, mailto, tel, and our internal mention protocol
        if (!isValidUrl(attr.value, ["http:", "https:", "mailto:", "tel:", "mention:"])) {
          attrsToRemove.push(attr.name);
        }
      }
      if (attr.name === "src") {
        // Allow http, https, and data (for images)
        if (!isValidUrl(attr.value, ["http:", "https:", "data:"])) {
          attrsToRemove.push(attr.name);
        }
      }
      // Remove other potentially dangerous attributes if necessary, e.g. style?
      // For now, removing inline styles is often requested but might break copy-paste styling.
      // Editor.js usually handles its own styling.
    }
    attrsToRemove.forEach((attr) => el.removeAttribute(attr));
  }

  return doc.body.innerHTML;
}
