import type { MentionItem } from "./types";

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function mentionIdFromHref(href: string | null): string | undefined {
  if (!href || !href.startsWith("mention://")) {
    return undefined;
  }
  return decodeURIComponent(href.slice("mention://".length));
}

export function readMentionItemFromElement(el: HTMLElement): MentionItem {
  let item: Partial<MentionItem> = {};

  // 1. Try payload
  const raw = el.dataset.mentionPayload;
  if (raw) {
    try {
      const decoded = JSON.parse(decodeURIComponent(raw));
      if (decoded && typeof decoded === "object") {
        item = decoded;
      }
    } catch {
      // ignore
    }
  }

  // 2. Fallback for ID
  if (!item.id) {
    item.id = el.dataset.mentionId || mentionIdFromHref((el as HTMLAnchorElement).getAttribute("href"));
  }

  // 3. Fallback for Display Name
  if (!item.displayName) {
    item.displayName = el.dataset.mentionDisplayName || el.textContent?.replace(/^@/, "");
  }

  // 4. Fallback for Metadata
  if (!item.description) {
    item.description = el.dataset.mentionDescription;
  }

  if (!item.image) {
    item.image = el.dataset.mentionImage;
  }

  if (!item.link) {
    item.link = el.dataset.mentionLink;
  }

  return {
    id: item.id || "",
    displayName: item.displayName || "",
    description: item.description,
    image: item.image,
    link: item.link
  };
}
