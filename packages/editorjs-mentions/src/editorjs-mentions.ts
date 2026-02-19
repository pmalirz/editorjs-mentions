import { MentionsDropdown } from "./dropdown";
import { normalizeProvider } from "./providers";
import { ensureMentionsStyleInjected } from "./styles";
import type { MentionItem, MentionRenderSource, MentionsConfig } from "./types";
import { escapeHtml, readMentionItemFromElement } from "./utils";

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
    Omit<
      MentionsConfig,
      "provider" | "holder" | "onSelect" | "renderItem" | "className" | "renderMention" | "mentionRenderContext"
    >
  > &
    Pick<MentionsConfig, "onSelect" | "renderItem" | "className" | "renderMention" | "mentionRenderContext">;
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
      className: config.className,
      renderMention: config.renderMention,
      mentionRenderContext: config.mentionRenderContext
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
    this.refreshMentionRendering();
  }

  setMentionRenderContext(context: unknown): void {
    this.config.mentionRenderContext = context;
    this.refreshMentionRendering();
  }

  refreshMentionRendering(): void {
    const mentions = Array.from(this.holder.querySelectorAll("a.editorjs-mention"));
    for (const mention of mentions) {
      const anchor = mention as HTMLAnchorElement;
      const item = readMentionItemFromElement(anchor);
      if (!item.id || !item.displayName) {
        continue;
      }
      const trigger = anchor.dataset.mentionTrigger || (anchor.textContent?.startsWith("@") ? "@" : "@");
      this.applyMentionRendering(anchor, item, trigger, "refresh");
    }
  }

  destroy(): void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;
    this.holder.removeEventListener("input", this.onInput, true);
    this.holder.removeEventListener("keydown", this.onKeyDown, true);
    this.holder.removeEventListener("click", this.onClick, true);
    this.holder.removeEventListener("copy", this.onCopy, true);
    this.holder.removeEventListener("cut", this.onCut, true);
    this.holder.removeEventListener("paste", this.onPaste, true);
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
    this.holder.addEventListener("copy", this.onCopy, true);
    this.holder.addEventListener("cut", this.onCut, true);
    this.holder.addEventListener("paste", this.onPaste, true);
    document.addEventListener("mousedown", this.onDocumentMouseDown, true);
  }

  private onClick = (event: MouseEvent): void => {
    const target = event.target instanceof HTMLElement ? event.target : null;
    const mentionNode = target?.closest("a.editorjs-mention") as HTMLAnchorElement | null;
    if (mentionNode) {
      event.preventDefault();
      const item = readMentionItemFromElement(mentionNode);
      if (item.id && item.displayName) {
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

  private onCopy = (event: ClipboardEvent): void => {
    this.handleCopyOrCut(event, false);
  };

  private onCut = (event: ClipboardEvent): void => {
    this.handleCopyOrCut(event, true);
  };

  private onPaste = (event: ClipboardEvent): void => {
    const data = event.clipboardData;
    if (!data) {
      return;
    }

    const customHtml = data.getData("application/x-editorjs-mentions");
    const plainHtml = data.getData("text/html");
    const candidateHtml = customHtml || plainHtml;
    if (!candidateHtml || !candidateHtml.includes("editorjs-mention")) {
      return;
    }

    const normalized = normalizeMentionAnchorsHtml(candidateHtml);
    if (!normalized) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = range.createContextualFragment(normalized);
    const pastedMentions = Array.from(fragment.querySelectorAll("a.editorjs-mention")) as HTMLAnchorElement[];
    const last = fragment.lastChild;
    range.insertNode(fragment);

    for (const mention of pastedMentions) {
      const item = readMentionItemFromElement(mention);
      if (!item.id || !item.displayName) {
        continue;
      }
      const trigger = mention.dataset.mentionTrigger || "@";
      this.applyMentionRendering(mention, item, trigger, "paste");
    }

    if (last) {
      const caret = document.createRange();
      caret.setStartAfter(last);
      caret.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caret);
    }
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (!this.dropdown.isVisible()) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.dropdown.moveDown();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.dropdown.moveUp();
      return;
    }

    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.dropdown.chooseActive();
      return;
    }

    if (event.key === "Escape") {
      event.stopPropagation();
      event.stopImmediatePropagation();
      this.dropdown.hide();
      this.activeContext = null;
    }
  };

  private handleCopyOrCut(event: ClipboardEvent, isCut: boolean): void {
    const selection = window.getSelection();
    const data = event.clipboardData;
    if (!selection || !selection.rangeCount || !data || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const root = range.commonAncestorContainer;
    if (!this.holder.contains(root.nodeType === Node.ELEMENT_NODE ? root : root.parentNode)) {
      return;
    }

    const fragment = range.cloneContents();
    const wrapper = document.createElement("div");
    wrapper.appendChild(fragment);
    const html = wrapper.innerHTML;

    if (!html.includes("editorjs-mention")) {
      return;
    }

    const normalized = normalizeMentionAnchorsHtml(html);
    const plain = selection.toString().replace(/\u00A0/g, " ");

    data.setData("text/plain", plain);
    data.setData("text/html", normalized);
    data.setData("application/x-editorjs-mentions", normalized);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (isCut) {
      range.deleteContents();
      selection.removeAllRanges();
      const caret = document.createRange();
      caret.setStart(range.startContainer, range.startOffset);
      caret.collapse(true);
      selection.addRange(caret);
    }
  }

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
    this.applyMentionRendering(anchor, item, context.trigger, "insert");

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

  private applyMentionRendering(
    anchor: HTMLAnchorElement,
    item: MentionItem,
    trigger: string,
    source: MentionRenderSource
  ): void {
    const defaultText = `${trigger}${item.displayName}`;
    if (!anchor.textContent || anchor.textContent.trim().length === 0) {
      anchor.textContent = defaultText;
    }

    if (!anchor.classList.contains("editorjs-mention")) {
      anchor.classList.add("editorjs-mention");
    }

    this.config.renderMention?.({
      item,
      trigger,
      defaultText,
      element: anchor,
      source,
      context: this.config.mentionRenderContext
    });
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

function normalizeMentionAnchorsHtml(html: string): string {
  const root = document.createElement("div");
  root.innerHTML = html;

  const mentions = Array.from(root.querySelectorAll("a.editorjs-mention, span.editorjs-mention"));
  for (const mention of mentions) {
    const el = mention as HTMLElement;
    const text = (el.textContent || "").replace(/\u00A0/g, " ");

    // Use utils to extract info
    const item = readMentionItemFromElement(el);
    if (!item.id || !item.displayName) {
      // If we can't extract valid mention info, maybe we should leave it as is?
      // But original code tried to normalize.
      // Let's rely on item having id and displayName fallback from utils.
      // If they are empty, we might have an issue.
    }

    const id = item.id;
    const displayName = item.displayName;
    const trigger = el.dataset.mentionTrigger || (text.startsWith("@") ? "@" : "@");

    const anchor = document.createElement("a");
    anchor.className = "editorjs-mention";
    anchor.contentEditable = "false";
    anchor.href = `mention://${encodeURIComponent(id)}`;
    anchor.dataset.mentionId = id;
    anchor.dataset.mentionDisplayName = displayName;
    anchor.dataset.mentionTrigger = trigger;
    anchor.dataset.mentionDescription = item.description || "";
    anchor.dataset.mentionImage = item.image || "";
    anchor.dataset.mentionLink = item.link || "";
    anchor.dataset.mentionPayload = encodeURIComponent(
      JSON.stringify({
        id,
        displayName,
        description: item.description,
        image: item.image,
        link: item.link
      })
    );
    anchor.textContent = text || `${trigger}${displayName}`;

    el.replaceWith(anchor);
  }

  return root.innerHTML;
}
