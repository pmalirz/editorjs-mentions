import EditorJS from "@editorjs/editorjs";
import { EditorJSMentions, createRestMentionProvider } from "@editorjs-mentions/plugin";
import "./styles.css";

async function bootstrap(): Promise<void> {
  let saveTimer: number | undefined;
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

  new EditorJSMentions({
    holder: "editor",
    triggerSymbols: ["@"],
    maxResults: 8,
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
    const data = await editor.save();
    output.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.textContent = `Failed to read editor data: ${message}`;
  }
}
