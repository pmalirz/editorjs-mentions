import type { MentionItem } from "./types";
import { escapeHtml } from "./utils";

/**
 * Manages the tooltip displayed when hovering over a mention.
 */
export class MentionsTooltip {
  private tooltipRoot: HTMLDivElement;

  constructor() {
    this.tooltipRoot = document.createElement("div");
    this.tooltipRoot.className = "editorjs-mention-tooltip";
    this.tooltipRoot.style.display = "none";
    document.body.appendChild(this.tooltipRoot);
  }

  /**
   * Shows the tooltip for a given mention item relative to the anchor element.
   *
   * @param anchor - The anchor element (the mention in the editor) to position against.
   * @param item - The mention data to display.
   */
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

  /**
   * Hides the tooltip and clears its content.
   */
  hide(): void {
    this.tooltipRoot.style.display = "none";
    this.tooltipRoot.innerHTML = "";
  }

  /**
   * Checks if the tooltip is currently visible.
   * @returns True if visible, false otherwise.
   */
  isVisible(): boolean {
    return this.tooltipRoot.style.display !== "none";
  }

  /**
   * Checks if the tooltip or its children contain the specified node.
   * Useful for handling click-outside logic.
   *
   * @param node - The node to check.
   * @returns True if the node is inside the tooltip.
   */
  contains(node: Node | null): boolean {
    return this.tooltipRoot.contains(node);
  }

  /**
   * Destroys the tooltip element, removing it from the DOM.
   */
  destroy(): void {
    this.tooltipRoot.remove();
  }
}
