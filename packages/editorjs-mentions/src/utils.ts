/**
 * Escapes special characters in a string for safe usage in HTML content.
 *
 * @param input - The string to escape.
 * @returns The escaped string safe for HTML interpolation.
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
 * Including backticks which can be dangerous in some contexts.
 *
 * @param input - The string to escape.
 * @returns The escaped string safe for HTML attribute values.
 */
export function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/`/g, "&#96;");
}
