import type { MentionItem } from "./types";
import { isValidUrl } from "./utils";

/**
 * Mentions tooltip for displaying detailed information about a selected or hovered mention.
 */
export class MentionsTooltip {
  private tooltipRoot: HTMLDivElement;

  /**
   * Initializes the MentionsTooltip and appends its root element to the body.
   */
  constructor() {
    this.tooltipRoot = document.createElement("div");
    this.tooltipRoot.className = "editorjs-mention-tooltip";
    this.tooltipRoot.style.display = "none";
    document.body.appendChild(this.tooltipRoot);
  }

  /**
   * Displays the tooltip near the given anchor element with data from the mention item.
   * @param anchor - The anchor element to position the tooltip around.
   * @param item - The mention item containing data to display.
   */
  show(anchor: HTMLElement, item: MentionItem): void {
    const rect = anchor.getBoundingClientRect();

    this.tooltipRoot.replaceChildren();

    const inner = document.createElement("div");
    inner.className = "editorjs-mention-tooltip-inner";

    if (item.image && isValidUrl(item.image)) {
      const img = document.createElement("img");
      img.className = "editorjs-mention-tooltip-image";
      img.src = item.image;
      img.alt = item.displayName;
      inner.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "editorjs-mention-tooltip-placeholder";
      placeholder.textContent = item.displayName.slice(0, 1).toUpperCase();
      inner.appendChild(placeholder);
    }

    const main = document.createElement("div");
    main.className = "editorjs-mention-tooltip-main";

    const name = document.createElement("div");
    name.className = "editorjs-mention-tooltip-name";
    name.textContent = item.displayName;
    main.appendChild(name);

    if (item.description) {
      const description = document.createElement("div");
      description.className = "editorjs-mention-tooltip-description";
      description.textContent = item.description;
      main.appendChild(description);
    }

    if (item.link && isValidUrl(item.link)) {
      const link = document.createElement("a");
      link.className = "editorjs-mention-tooltip-link";
      link.href = item.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Open details";
      main.appendChild(link);
    }

    inner.appendChild(main);
    this.tooltipRoot.appendChild(inner);

    this.tooltipRoot.style.display = "block";
    this.tooltipRoot.style.left = `${Math.max(8, rect.left)}px`;
    this.tooltipRoot.style.top = `${Math.max(8, rect.bottom + 6)}px`;
  }

  /**
   * Hides the tooltip and clears its contents.
   */
  hide(): void {
    this.tooltipRoot.style.display = "none";
    this.tooltipRoot.replaceChildren();
  }

  /**
   * Checks if the tooltip is currently visible.
   * @returns True if the tooltip is visible, false otherwise.
   */
  isVisible(): boolean {
    return this.tooltipRoot.style.display !== "none";
  }

  /**
   * Determines if the given DOM node is contained within the tooltip.
   * @param node - The node to check.
   * @returns True if the node is contained within the tooltip, false otherwise.
   */
  contains(node: Node | null): boolean {
    return this.tooltipRoot.contains(node);
  }

  /**
   * Completely removes the tooltip from the DOM.
   */
  destroy(): void {
    this.tooltipRoot.remove();
  }
}
