import type { MentionItem } from "./types";
import { isValidUrl } from "./utils";

/**
 * Renders the tooltip for a mention showing detailed information.
 */
export class MentionsTooltip {
  private tooltipRoot: HTMLDivElement;

  /**
   * Initializes the tooltip component.
   */
  constructor() {
    this.tooltipRoot = document.createElement("div");
    this.tooltipRoot.className = "editorjs-mention-tooltip";
    this.tooltipRoot.style.display = "none";
    document.body.appendChild(this.tooltipRoot);
  }

  /**
   * Displays the tooltip anchored to the given element for the specified item.
   * @param anchor - The element to attach the tooltip to.
   * @param item - The mention item to display details for.
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
   * Returns whether the tooltip is currently visible.
   * @returns true if visible, false otherwise.
   */
  isVisible(): boolean {
    return this.tooltipRoot.style.display !== "none";
  }

  /**
   * Checks if the tooltip element contains the given node.
   * @param node - The node to check for containment.
   * @returns true if the tooltip contains the node, false otherwise.
   */
  contains(node: Node | null): boolean {
    return this.tooltipRoot.contains(node);
  }

  /**
   * Destroys the tooltip and cleans up DOM elements.
   */
  destroy(): void {
    this.tooltipRoot.remove();
  }
}
