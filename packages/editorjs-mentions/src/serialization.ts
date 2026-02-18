import type { EditorJSOutputLike, MentionEntity } from "./types";

type MentionPayload = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
  link?: string;
};

export function encodeMentionsInOutput(output: EditorJSOutputLike): EditorJSOutputLike {
  const clone = cloneOutput(output);

  for (const block of clone.blocks) {
    const text = block.data?.text;
    if (typeof text !== "string") {
      continue;
    }

    const encoded = encodeMentionsFromHtml(text);
    block.data.text = encoded.text;
    if (encoded.entities.length > 0) {
      block.data.entities = encoded.entities;
    } else {
      delete block.data.entities;
    }
  }

  return clone;
}

export function decodeMentionsInOutput(output: EditorJSOutputLike): EditorJSOutputLike {
  const clone = cloneOutput(output);

  for (const block of clone.blocks) {
    const text = block.data?.text;
    const entities = block.data?.entities;
    if (typeof text !== "string" || !Array.isArray(entities)) {
      continue;
    }

    const mentionEntities = entities.filter(isMentionEntity).sort((a, b) => a.start - b.start);
    block.data.text = decodeMentionsToHtml(text, mentionEntities);
  }

  return clone;
}

export function encodeMentionsFromHtml(html: string): { text: string; entities: MentionEntity[] } {
  const root = document.createElement("div");
  root.innerHTML = html;

  const entities: MentionEntity[] = [];
  let text = "";

  const walk = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += (node.textContent || "").replace(/\u00A0/g, " ");
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = node as HTMLElement;
    const isMention =
      (el.tagName === "A" && (el.classList.contains("editorjs-mention") || mentionIdFromHref(el.getAttribute("href")))) ||
      !!el.dataset.mentionId;

    if (isMention) {
      const mentionText = (el.textContent || "").replace(/\u00A0/g, " ");
      const payload = readMentionPayload(el);
      const id = payload.id || el.dataset.mentionId || mentionIdFromHref(el.getAttribute("href")) || mentionText;
      const start = text.length;
      text += mentionText;
      const end = text.length;
      entities.push({
        type: "mention",
        id,
        displayName: payload.displayName || el.dataset.mentionDisplayName || mentionText.replace(/^@/, ""),
        description: payload.description || undefined,
        image: payload.image || undefined,
        link: payload.link || undefined,
        trigger: el.dataset.mentionTrigger || (mentionText.startsWith("@") ? "@" : undefined),
        start,
        end
      });
      return;
    }

    for (const child of Array.from(el.childNodes)) {
      walk(child);
    }
  };

  for (const node of Array.from(root.childNodes)) {
    walk(node);
  }

  return { text, entities };
}

export function decodeMentionsToHtml(text: string, entities: MentionEntity[]): string {
  let cursor = 0;
  let html = "";

  for (const entity of entities) {
    if (entity.start < cursor || entity.end < entity.start || entity.end > text.length) {
      continue;
    }

    const rawBefore = text.slice(cursor, entity.start);
    const rawMention = text.slice(entity.start, entity.end);

    html += escapeHtml(rawBefore);
    html += renderMentionAnchor(rawMention, entity);
    cursor = entity.end;
  }

  html += escapeHtml(text.slice(cursor));
  return html.replace(/  /g, " &nbsp;");
}

function renderMentionAnchor(displayText: string, entity: MentionEntity): string {
  const payload = encodeURIComponent(
    JSON.stringify({
      id: entity.id,
      displayName: entity.displayName,
      description: entity.description,
      image: entity.image,
      link: entity.link
    })
  );
  const href = `mention://${encodeURIComponent(entity.id)}`;
  const visible = displayText || `${entity.trigger || "@"}${entity.displayName}`;

  return `<a class="editorjs-mention" href="${escapeAttr(href)}" data-mention-id="${escapeAttr(
    entity.id
  )}" data-mention-display-name="${escapeAttr(entity.displayName)}" data-mention-trigger="${escapeAttr(
    entity.trigger || "@"
  )}" data-mention-payload="${escapeAttr(payload)}">${escapeHtml(visible)}</a>`;
}

function readMentionPayload(el: HTMLElement): MentionPayload {
  const raw = el.dataset.mentionPayload;
  if (!raw) {
    return { id: "", displayName: "" };
  }

  try {
    const decoded = JSON.parse(decodeURIComponent(raw)) as MentionPayload;
    return decoded || { id: "", displayName: "" };
  } catch {
    return { id: "", displayName: "" };
  }
}

function mentionIdFromHref(href: string | null): string | undefined {
  if (!href) {
    return undefined;
  }
  if (!href.startsWith("mention://")) {
    return undefined;
  }
  return decodeURIComponent(href.slice("mention://".length));
}

function isMentionEntity(value: unknown): value is MentionEntity {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<MentionEntity>;
  return (
    item.type === "mention" &&
    typeof item.id === "string" &&
    typeof item.displayName === "string" &&
    typeof item.start === "number" &&
    typeof item.end === "number"
  );
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/`/g, "&#96;");
}

function cloneOutput(output: EditorJSOutputLike): EditorJSOutputLike {
  return JSON.parse(JSON.stringify(output)) as EditorJSOutputLike;
}
