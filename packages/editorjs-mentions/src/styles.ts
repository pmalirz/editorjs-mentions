const MENTIONS_STYLE_ID = "editorjs-mentions-style";

const CSS = `
.editorjs-mention {
  background: #e9f2ff;
  color: #0b4fb3;
  border-radius: 4px;
  padding: 0 4px;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
}

.editorjs-mentions-dropdown {
  position: fixed;
  min-width: 260px;
  max-width: 360px;
  max-height: 280px;
  overflow: auto;
  z-index: 9999;
  background: #fff;
  border: 1px solid #d7dde5;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
}

.editorjs-mentions-item {
  display: grid;
  grid-template-columns: 28px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
}

.editorjs-mentions-item:hover,
.editorjs-mentions-item[data-active="true"] {
  background: #f4f8ff;
}

.editorjs-mentions-item-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  background: #d5def0;
}

.editorjs-mentions-item-main {
  min-width: 0;
}

.editorjs-mentions-item-name {
  font-size: 14px;
  color: #1f2937;
  line-height: 1.2;
}

.editorjs-mentions-item-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.editorjs-mention-tooltip {
  position: fixed;
  z-index: 10000;
  min-width: 220px;
  max-width: 320px;
  background: #fff;
  border: 1px solid #d7dde5;
  border-radius: 10px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
}

.editorjs-mention-tooltip-inner {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 10px;
  padding: 10px;
  align-items: start;
}

.editorjs-mention-tooltip-image,
.editorjs-mention-tooltip-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.editorjs-mention-tooltip-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d5def0;
  color: #334155;
  font-weight: 600;
}

.editorjs-mention-tooltip-name {
  font-size: 14px;
  line-height: 1.2;
  color: #1f2937;
}

.editorjs-mention-tooltip-description {
  margin-top: 2px;
  font-size: 12px;
  color: #6b7280;
}

.editorjs-mention-tooltip-link {
  margin-top: 7px;
  display: inline-block;
  font-size: 12px;
  color: #0b4fb3;
}
`;

export function ensureMentionsStyleInjected(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(MENTIONS_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = MENTIONS_STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}
