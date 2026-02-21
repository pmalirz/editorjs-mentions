import type { MentionItem } from "./types";
import { escapeHtml } from "./utils";

export class MentionsTooltip {
  private tooltipRoot: HTMLDivElement;

  constructor() {
    this.tooltipRoot = document.createElement("div");
    this.tooltipRoot.className = "editorjs-mention-tooltip";
    this.tooltipRoot.style.display = "none";
    document.body.appendChild(this.tooltipRoot);
  }

  show(anchor: HTMLElement, item: MentionItem): void {
    const rect = anchor.getBoundingClientRect();
    const linkHtml = item.link
      ? `<a class="editorjs-mention-tooltip-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Open details</a>`
      : "";
    const imageHtml = item.image
      ? `<img class="editorjs-mention-tooltip-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.displayName)}" />`
      : `<div class="editorjs-mention-tooltip-placeholder">${escapeHtml(item.displayName.slice(0, 1).toUpperCase())}</div>`;

    this.tooltipRoot.innerHTML = `
      <div class="editorjs-mention-tooltip-inner">
        ${imageHtml}
        <div class="editorjs-mention-tooltip-main">
          <div class="editorjs-mention-tooltip-name">${escapeHtml(item.displayName)}</div>
          ${item.description ? `<div class="editorjs-mention-tooltip-description">${escapeHtml(item.description)}</div>` : ""}
          ${linkHtml}
        </div>
      </div>
    `;

    this.tooltipRoot.style.display = "block";
    this.tooltipRoot.style.left = `${Math.max(8, rect.left)}px`;
    this.tooltipRoot.style.top = `${Math.max(8, rect.bottom + 6)}px`;
  }

  hide(): void {
    this.tooltipRoot.style.display = "none";
    this.tooltipRoot.innerHTML = "";
  }

  isVisible(): boolean {
    return this.tooltipRoot.style.display !== "none";
  }

  contains(node: Node | null): boolean {
    return this.tooltipRoot.contains(node);
  }

  destroy(): void {
    this.tooltipRoot.remove();
  }
}
