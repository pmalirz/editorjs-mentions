import type { MentionItem } from "./types";
import { escapeHtml, isValidUrl } from "./utils";

type DropdownOptions = {
  className?: string;
  renderItem?: (item: MentionItem) => string;
  onSelect: (item: MentionItem) => void;
};

/**
 * Renders the mention autocomplete dropdown overlay.
 */
export class MentionsDropdown {
  private root: HTMLDivElement;
  private items: MentionItem[] = [];
  private activeIndex = 0;
  private onSelect: (item: MentionItem) => void;
  private renderItem?: (item: MentionItem) => string;
  private className?: string;

  /**
   * Initializes the dropdown with the given options.
   * @param options - Configuration options for the dropdown.
   */
  constructor(options: DropdownOptions) {
    this.onSelect = options.onSelect;
    this.renderItem = options.renderItem;
    this.className = options.className;

    this.root = document.createElement("div");
    this.root.className = this.className || "editorjs-mentions-dropdown";
    this.root.style.display = "none";

    document.body.appendChild(this.root);
  }

  /**
   * Displays the dropdown with the given items at the specified position.
   * @param position - The coordinates to show the dropdown.
   * @param items - The list of mention items to display.
   */
  show(position: { left: number; top: number }, items: MentionItem[]): void {
    this.items = items;
    this.activeIndex = 0;
    this.root.replaceChildren();

    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "editorjs-mentions-item";
      row.dataset.active = index === this.activeIndex ? "true" : "false";
      row.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.onSelect(item);
      });

      if (this.renderItem) {
        row.innerHTML = this.renderItem(item);
      } else {
        const avatar = document.createElement("img");
        avatar.className = "editorjs-mentions-item-avatar";
        avatar.alt = item.displayName;
        avatar.src =
          (item.image && isValidUrl(item.image) ? item.image : "") ||
          `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect width="28" height="28" fill="#D5DEF0"/><text x="50%" y="55%" text-anchor="middle" fill="#334155" font-size="12" font-family="sans-serif">${escapeHtml(
              item.displayName.slice(0, 1).toUpperCase()
            )}</text></svg>`
          )}`;

        const main = document.createElement("div");
        main.className = "editorjs-mentions-item-main";

        const name = document.createElement("div");
        name.className = "editorjs-mentions-item-name";
        name.textContent = item.displayName;

        main.appendChild(name);

        if (item.description) {
          const description = document.createElement("div");
          description.className = "editorjs-mentions-item-description";
          description.textContent = item.description;
          main.appendChild(description);
        }

        row.appendChild(avatar);
        row.appendChild(main);
      }

      this.root.appendChild(row);
    });

    this.root.style.left = `${Math.max(8, position.left)}px`;
    this.root.style.top = `${Math.max(8, position.top)}px`;
    this.root.style.display = items.length > 0 ? "block" : "none";
  }

  /**
   * Hides the dropdown and clears the active items.
   */
  hide(): void {
    this.root.style.display = "none";
    this.items = [];
    this.activeIndex = 0;
  }

  /**
   * Returns whether the dropdown is currently visible.
   * @returns true if visible, false otherwise.
   */
  isVisible(): boolean {
    return this.root.style.display !== "none";
  }

  /**
   * Returns whether the dropdown currently has items to display.
   * @returns true if it has items, false otherwise.
   */
  hasItems(): boolean {
    return this.items.length > 0;
  }

  /**
   * Selects the previous item in the dropdown list, wrapping around if necessary.
   */
  moveUp(): void {
    if (!this.items.length) {
      return;
    }
    this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
    this.syncActiveRow();
  }

  /**
   * Selects the next item in the dropdown list, wrapping around if necessary.
   */
  moveDown(): void {
    if (!this.items.length) {
      return;
    }
    this.activeIndex = (this.activeIndex + 1) % this.items.length;
    this.syncActiveRow();
  }

  /**
   * Commits the currently active item, firing the onSelect callback.
   */
  chooseActive(): void {
    if (!this.items.length) {
      return;
    }
    this.onSelect(this.items[this.activeIndex]);
  }

  /**
   * Destroys the dropdown and cleans up DOM elements.
   */
  destroy(): void {
    this.root.remove();
  }

  private syncActiveRow(): void {
    let index = 0;
    for (const child of this.root.children) {
      const row = child as HTMLElement;
      row.dataset.active = index === this.activeIndex ? "true" : "false";
      if (index === this.activeIndex) {
        row.scrollIntoView({ block: "nearest" });
      }
      index++;
    }
  }
}
