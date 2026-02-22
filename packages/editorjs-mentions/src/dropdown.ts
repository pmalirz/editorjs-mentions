import type { MentionItem } from "./types";

type DropdownOptions = {
  className?: string;
  renderItem?: (item: MentionItem) => string;
  onSelect: (item: MentionItem) => void;
};

/**
 * Manages the dropdown menu for selecting mentions.
 */
export class MentionsDropdown {
  private root: HTMLDivElement;
  private items: MentionItem[] = [];
  private activeIndex = 0;
  private onSelect: (item: MentionItem) => void;
  private renderItem?: (item: MentionItem) => string;
  private className?: string;

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
   * Shows the dropdown at the specified position with the given items.
   *
   * @param position - The coordinates {top, left} where the dropdown should appear.
   * @param items - The list of mention items to display.
   */
  show(position: { left: number; top: number }, items: MentionItem[]): void {
    this.items = items;
    this.activeIndex = 0;
    this.root.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "editorjs-mentions-item";
      row.dataset.active = index === this.activeIndex ? "true" : "false";
      row.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.onSelect(item);
      });

      if (this.renderItem) {
        // If a custom render function is provided, we trust it returns safe HTML or that the user handles escaping.
        row.innerHTML = this.renderItem(item);
      } else {
        // Default rendering: constructs DOM elements to ensure safety against XSS.
        const avatar = document.createElement("img");
        avatar.className = "editorjs-mentions-item-avatar";
        avatar.alt = item.displayName;
        avatar.src =
          item.image ||
          `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><rect width="28" height="28" fill="#D5DEF0"/><text x="50%" y="55%" text-anchor="middle" fill="#334155" font-size="12" font-family="sans-serif">${item.displayName
              .slice(0, 1)
              .toUpperCase()}</text></svg>`
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
   * Hides the dropdown and clears the items.
   */
  hide(): void {
    this.root.style.display = "none";
    this.items = [];
    this.activeIndex = 0;
  }

  /**
   * Checks if the dropdown is currently visible.
   * @returns True if visible, false otherwise.
   */
  isVisible(): boolean {
    return this.root.style.display !== "none";
  }

  /**
   * Checks if the dropdown has any items.
   * @returns True if items array is not empty.
   */
  hasItems(): boolean {
    return this.items.length > 0;
  }

  /**
   * Moves the active selection up by one item.
   * Cycles to the bottom if at the top.
   */
  moveUp(): void {
    if (!this.items.length) {
      return;
    }
    this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length;
    this.syncActiveRow();
  }

  /**
   * Moves the active selection down by one item.
   * Cycles to the top if at the bottom.
   */
  moveDown(): void {
    if (!this.items.length) {
      return;
    }
    this.activeIndex = (this.activeIndex + 1) % this.items.length;
    this.syncActiveRow();
  }

  /**
   * Triggers the selection of the currently active item.
   */
  chooseActive(): void {
    if (!this.items.length) {
      return;
    }
    this.onSelect(this.items[this.activeIndex]);
  }

  /**
   * Destroys the dropdown element, removing it from the DOM.
   */
  destroy(): void {
    this.root.remove();
  }

  private syncActiveRow(): void {
    Array.from(this.root.children).forEach((child, index) => {
      const row = child as HTMLElement;
      row.dataset.active = index === this.activeIndex ? "true" : "false";
      if (index === this.activeIndex) {
        row.scrollIntoView({ block: "nearest" });
      }
    });
  }
}
