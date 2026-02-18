import EditorJS from "@editorjs/editorjs";
import {
  EditorJSMentions,
  createRestMentionProvider,
  encodeMentionsInOutput,
  type EditorJSOutputLike
} from "@editorjs-mentions/plugin";
import "./styles.css";

async function bootstrap(): Promise<void> {
  let saveTimer: number | undefined;
  const currentUserSelect = document.getElementById("current-user") as HTMLSelectElement | null;
  const currentUser = currentUserSelect?.value || "";
  const editor = new EditorJS({
    holder: "editor",
    autofocus: true,
    placeholder: "Start typing and use @ to mention users...",
    onChange: async () => {
      if (saveTimer) {
        window.clearTimeout(saveTimer);
      }
      saveTimer = window.setTimeout(() => {
        void renderRawData(editor);
      }, 120);
    }
  });

  await editor.isReady;

  const mentions = new EditorJSMentions({
    holder: "editor",
    triggerSymbols: ["@"],
    maxResults: 8,
    mentionRenderContext: { currentUserDisplayName: currentUser },
    renderMention: ({ item, defaultText, element, context }) => {
      const ctx = context as { currentUserDisplayName?: string } | undefined;
      const isCurrentUser = !!ctx?.currentUserDisplayName && ctx.currentUserDisplayName === item.displayName;
      element.textContent = defaultText;
      element.style.fontWeight = isCurrentUser ? "700" : "400";
      element.style.background = isCurrentUser ? "#fff3cd" : "#e9f2ff";
      element.style.color = isCurrentUser ? "#7a4b00" : "#0b4fb3";
    },
    provider: createRestMentionProvider({
      endpoint: "http://localhost:3001/api/mentions/users"
    }),
    onSelect: (item) => {
      const el = document.getElementById("last-selected");
      if (el) {
        el.textContent = `Last selected: ${item.displayName} (${item.id})`;
      }
      void renderRawData(editor);
    }
  });

  const footer = document.createElement("p");
  footer.id = "last-selected";
  footer.className = "selected";
  footer.textContent = "Last selected: none";
  document.querySelector(".panel")?.appendChild(footer);

  const refreshButton = document.getElementById("refresh-data");
  refreshButton?.addEventListener("click", () => {
    void renderRawData(editor);
  });
  currentUserSelect?.addEventListener("change", () => {
    mentions.setMentionRenderContext({
      currentUserDisplayName: currentUserSelect.value || undefined
    });
  });

  await renderRawData(editor);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const panel = document.querySelector(".panel");
  if (panel) {
    const errorEl = document.createElement("pre");
    errorEl.className = "error";
    errorEl.textContent = `Failed to initialize demo:\n${message}`;
    panel.appendChild(errorEl);
  }
});

async function renderRawData(editor: EditorJS): Promise<void> {
  const output = document.getElementById("raw-data");
  if (!output) {
    return;
  }

  try {
    const data = (await editor.save()) as EditorJSOutputLike;
    const normalized = encodeMentionsInOutput(data);
    output.textContent = JSON.stringify(normalized, null, 2);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.textContent = `Failed to read editor data: ${message}`;
  }
}
