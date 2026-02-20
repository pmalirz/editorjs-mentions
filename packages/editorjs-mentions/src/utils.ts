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
