# @editorjs-mentions/plugin

Mentions autocomplete plugin for Editor.js.

## Install

```bash
npm i @editorjs-mentions/plugin
```

## Usage

```ts
import { EditorJSMentions, createRestMentionProvider } from "@editorjs-mentions/plugin";

const mentions = new EditorJSMentions({
  holder: "editor",
  triggerSymbols: ["@"],
  mentionRenderContext: { currentUserDisplayName: "Joanna Smith" },
  renderMention: ({ item, defaultText, element, context }) => {
    const ctx = context as { currentUserDisplayName?: string } | undefined;
    const isCurrentUser = ctx?.currentUserDisplayName === item.displayName;
    element.textContent = defaultText;
    element.style.fontWeight = isCurrentUser ? "700" : "400";
  },
  provider: createRestMentionProvider({
    endpoint: "http://localhost:3001/api/mentions/users"
  })
});

mentions.setMentionRenderContext({ currentUserDisplayName: "John Doe" });
mentions.refreshMentionRendering();

// mentions.destroy();
```

## Config

- `holder: string | HTMLElement` - Editor.js holder element or id.
- `provider` - mention source function/object.
- `triggerSymbols?: string[]` - defaults to `["@"]`.
- `maxResults?: number` - defaults to `8`.
- `minChars?: number` - defaults to `0`.
- `debounceMs?: number` - defaults to `160`.
- `className?: string` - custom dropdown class.
- `onSelect?: (item) => void`.
- `renderItem?: (item) => string` - custom item renderer.
- `renderMention?: (args) => void` - customize rendered mention anchor per entity state.
- `mentionRenderContext?: unknown` - dynamic context available in `renderMention`.
- Clicking a mention opens a small details tooltip (image, name, description, optional link).
- Copy/cut/paste of mentions inside Editor.js preserves mention metadata (`id`, description, image, link).

## Data Model

```ts
type MentionItem = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
  link?: string;
};
```

## Structured Save Format

To keep stable IDs in persisted payloads:

```ts
import { encodeMentionsInOutput } from "@editorjs-mentions/plugin";

const nativeOutput = await editor.save();
const serverOutput = encodeMentionsInOutput(nativeOutput);
```

Use `decodeMentionsInOutput(...)` to rebuild mention HTML when loading a stored payload with `entities`.

## Clipboard Notes

- In-editor copy/paste keeps mention structure via custom clipboard payload + HTML normalization.
- Pasting into external apps falls back to plain text representation (for example `@John Doe`).
