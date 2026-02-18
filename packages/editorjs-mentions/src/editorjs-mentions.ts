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
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.dropdown.destroy();
  }

  private bind(): void {
    this.holder.addEventListener("input", this.onInput, true);
    this.holder.addEventListener("keydown", this.onKeyDown, true);
    this.holder.addEventListener("click", this.onClick, true);
  }

  private onClick = (): void => {
    if (!this.dropdown.isVisible()) {
      return;
    }
    this.evaluateAndFetch();
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

    const mention = document.createElement("span");
    mention.className = "editorjs-mention";
    mention.contentEditable = "false";
    mention.dataset.mentionId = item.id;
    mention.dataset.mentionDisplayName = item.displayName;
    mention.dataset.mentionTrigger = context.trigger;
    mention.textContent = `${context.trigger}${item.displayName}`;

    const trailingSpace = document.createTextNode("\u00A0");

    range.insertNode(trailingSpace);
    range.insertNode(mention);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const caretRange = document.createRange();
      caretRange.setStartAfter(trailingSpace);
      caretRange.collapse(true);
      selection.addRange(caretRange);
    }

    this.dropdown.hide();
    this.activeContext = null;
    this.config.onSelect?.(item);
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

