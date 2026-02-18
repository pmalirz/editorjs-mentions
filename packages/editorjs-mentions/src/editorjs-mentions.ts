import { MentionsDropdown } from "./dropdown";
import { normalizeProvider } from "./providers";
import { ensureMentionsStyleInjected } from "./styles";
import type { MentionItem, MentionsConfig } from "./types";

type ActiveContext = {
  trigger: string;
  query: string;
  textNode: Text;
  startOffset: number;
  endOffset: number;
};

export class EditorJSMentions {
  private holder: HTMLElement;
  private config: Required<
    Omit<MentionsConfig, "provider" | "holder" | "onSelect" | "renderItem" | "className">
  > &
    Pick<MentionsConfig, "onSelect" | "renderItem" | "className">;
  private provider: ReturnType<typeof normalizeProvider>;
  private dropdown: MentionsDropdown;
  private debounceTimer: number | undefined;
  private requestSerial = 0;
  private activeContext: ActiveContext | null = null;
  private destroyed = false;
  private tooltipRoot: HTMLDivElement;

  constructor(config: MentionsConfig) {
    this.holder =
      typeof config.holder === "string"
        ? (document.getElementById(config.holder) ??
          (() => {
            throw new Error(`Cannot find holder element by id: ${config.holder}`);
          })())
        : config.holder;

    this.config = {
      triggerSymbols: config.triggerSymbols ?? ["@"],
      maxResults: config.maxResults ?? 8,
      minChars: config.minChars ?? 0,
      debounceMs: config.debounceMs ?? 160,
      onSelect: config.onSelect,
      renderItem: config.renderItem,
      className: config.className
    };

    this.provider = normalizeProvider(config.provider);

    ensureMentionsStyleInjected();

    this.dropdown = new MentionsDropdown({
      className: this.config.className,
      renderItem: this.config.renderItem,
      onSelect: (item) => this.selectMention(item)
    });
    this.tooltipRoot = document.createElement("div");
    this.tooltipRoot.className = "editorjs-mention-tooltip";
    this.tooltipRoot.style.display = "none";
    document.body.appendChild(this.tooltipRoot);

    this.bind();
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.holder.removeEventListener("input", this.onInput, true);
    this.holder.removeEventListener("keydown", this.onKeyDown, true);
    this.holder.removeEventListener("click", this.onClick, true);
    document.removeEventListener("mousedown", this.onDocumentMouseDown, true);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.dropdown.destroy();
    this.tooltipRoot.remove();
  }

  private bind(): void {
    this.holder.addEventListener("input", this.onInput, true);
    this.holder.addEventListener("keydown", this.onKeyDown, true);
    this.holder.addEventListener("click", this.onClick, true);
    document.addEventListener("mousedown", this.onDocumentMouseDown, true);
  }

  private onClick = (event: MouseEvent): void => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const mentionNode = target?.closest("a.editorjs-mention") as HTMLAnchorElement | null;
    if (mentionNode) {
      event.preventDefault();
      const item = this.readMentionFromElement(mentionNode);
      if (item) {
        this.showTooltip(mentionNode, item);
      }
      return;
    }

    this.hideTooltip();

    if (!this.dropdown.isVisible()) {
      return;
    }
    this.evaluateAndFetch();
  };

  private onDocumentMouseDown = (event: MouseEvent): void => {
    if (!this.tooltipRoot || this.tooltipRoot.style.display === "none") {
      return;
    }
    const target = event.target as Node | null;
    if (!target) {
      return;
    }
    const clickedMention = target instanceof HTMLElement ? target.closest("a.editorjs-mention") : null;
    if (clickedMention || this.tooltipRoot.contains(target)) {
      return;
    }
    this.hideTooltip();
  };

  private onInput = (): void => {
    this.evaluateAndFetch();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.dropdown.isVisible()) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.dropdown.moveDown();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.dropdown.moveUp();
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      this.dropdown.chooseActive();
      return;
    }

    if (event.key === "Escape") {
      this.dropdown.hide();
      this.activeContext = null;
    }
  };

  private evaluateAndFetch(): void {
    this.activeContext = this.readActiveContext();

    if (!this.activeContext || this.activeContext.query.length < this.config.minChars) {
      this.dropdown.hide();
      return;
    }

    const requestId = ++this.requestSerial;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(async () => {
      try {
        const items = await this.provider({
          trigger: this.activeContext!.trigger,
          query: this.activeContext!.query,
          limit: this.config.maxResults
        });

        if (requestId !== this.requestSerial || !this.activeContext) {
          return;
        }

        const caretRect = this.getCaretRect();
        if (!caretRect) {
          this.dropdown.hide();
          return;
        }

        this.dropdown.show(
          {
            left: caretRect.left,
            top: caretRect.bottom + 6
          },
          items
        );
      } catch {
        this.dropdown.hide();
      }
    }, this.config.debounceMs);
  }

  private readActiveContext(): ActiveContext | null {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    let node: Node = range.startContainer;
    let offset = range.startOffset;

    if (node.nodeType !== Node.TEXT_NODE) {
      if (!node.childNodes.length || offset === 0) {
        return null;
      }
      const child = node.childNodes[Math.max(0, offset - 1)];
      if (!child || child.nodeType !== Node.TEXT_NODE) {
        return null;
      }
      node = child;
      offset = (child as Text).data.length;
    }

    const textNode = node as Text;
    const textBefore = textNode.data.slice(0, offset);

    let best: { trigger: string; index: number } | null = null;
    for (const trigger of this.config.triggerSymbols) {
      const index = textBefore.lastIndexOf(trigger);
      if (index < 0) {
        continue;
      }
      if (best === null || index > best.index) {
        best = { trigger, index };
      }
    }

    if (!best) {
      return null;
    }

    const charBeforeTrigger = best.index === 0 ? " " : textBefore[best.index - 1];
    if (!/\s/.test(charBeforeTrigger)) {
      return null;
    }

    const query = textBefore.slice(best.index + best.trigger.length);
    if (/\s/.test(query)) {
      return null;
    }

    return {
      trigger: best.trigger,
      query,
      textNode,
      startOffset: best.index,
      endOffset: offset
    };
  }

  private selectMention(item: MentionItem): void {
    const context = this.activeContext;
    if (!context) {
      return;
    }

    const range = document.createRange();
    range.setStart(context.textNode, context.startOffset);
    range.setEnd(context.textNode, context.endOffset);
    range.deleteContents();

    const anchor = document.createElement("a");
    anchor.className = "editorjs-mention";
    anchor.contentEditable = "false";
    anchor.href = `mention://${encodeURIComponent(item.id)}`;
    anchor.dataset.mentionPayload = encodeURIComponent(
      JSON.stringify({
        id: item.id,
        displayName: item.displayName,
        description: item.description,
        image: item.image,
        link: item.link
      })
    );
    anchor.dataset.mentionLink = item.link || "";
    anchor.dataset.mentionDescription = item.description || "";
    anchor.dataset.mentionImage = item.image || "";
    anchor.dataset.mentionId = item.id;
    anchor.dataset.mentionDisplayName = item.displayName;
    anchor.dataset.mentionTrigger = context.trigger;
    anchor.textContent = `${context.trigger}${item.displayName}`;

    const trailingSpace = document.createTextNode("\u00A0");

    range.insertNode(trailingSpace);
    range.insertNode(anchor);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const caretRange = document.createRange();
      caretRange.setStartAfter(trailingSpace);
      caretRange.collapse(true);
      selection.addRange(caretRange);
    }

    this.dropdown.hide();
    this.hideTooltip();
    this.activeContext = null;
    this.config.onSelect?.(item);
  }

  private showTooltip(anchor: HTMLAnchorElement, item: MentionItem): void {
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

  private hideTooltip(): void {
    this.tooltipRoot.style.display = "none";
    this.tooltipRoot.innerHTML = "";
  }

  private readMentionFromElement(anchor: HTMLAnchorElement): MentionItem | null {
    const payload = anchor.dataset.mentionPayload;
    if (payload) {
      try {
        const json = JSON.parse(decodeURIComponent(payload)) as MentionItem;
        if (json && typeof json.id === "string" && typeof json.displayName === "string") {
          return json;
        }
      } catch {
        // noop
      }
    }

    const id = anchor.dataset.mentionId;
    const displayName = anchor.dataset.mentionDisplayName || anchor.textContent?.replace(/^@/, "");
    if (!id || !displayName) {
      return null;
    }

    return {
      id,
      displayName,
      description: anchor.dataset.mentionDescription || undefined,
      image: anchor.dataset.mentionImage || undefined,
      link: anchor.dataset.mentionLink || undefined
    };
  }

  private getCaretRect(): DOMRect | null {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(true);
    const rect = range.getBoundingClientRect();

    if (!rect || (rect.x === 0 && rect.y === 0 && rect.width === 0 && rect.height === 0)) {
      const marker = document.createElement("span");
      marker.textContent = "\u200b";
      range.insertNode(marker);
      const markerRect = marker.getBoundingClientRect();
      marker.remove();
      return markerRect;
    }

    return rect;
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
