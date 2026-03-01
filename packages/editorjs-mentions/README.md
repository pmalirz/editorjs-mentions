# @editorjs-mentions/plugin

Mentions autocomplete plugin for Editor.js.

![Mentions usage demo](docs/mentions-usage-example.gif)

## Install

```bash
npm i @editorjs-mentions/plugin
```

Peer dependency:

```bash
npm i @editorjs/editorjs
```

## Quick Start

```ts
import EditorJS from "@editorjs/editorjs";
import {
  EditorJSMentions,
  createRestMentionProvider
} from "@editorjs-mentions/plugin";

const editor = new EditorJS({ holder: "editor" });
await editor.isReady;

const mentions = new EditorJSMentions({
  holder: "editor",
  triggerSymbols: ["@"],
  provider: createRestMentionProvider({
    endpoint: "http://localhost:3001/api/mentions/users"
  })
});

// later:
// mentions.destroy();
```

## Config

- `holder: string | HTMLElement` - Editor.js holder element or id.
- `provider` - mention source function/object (required).
- `triggerSymbols?: string[]` - defaults to `["@"]`.
- `maxResults?: number` - defaults to `8`.
- `minChars?: number` - defaults to `0`.
- `debounceMs?: number` - defaults to `160`.
- `className?: string` - custom dropdown class.
- `onSelect?: (item) => void`.
- `renderItem?: (item) => string`.
- `renderMention?: (args) => void`.
- `mentionRenderContext?: unknown`.

## Mention Data Model

```ts
type MentionItem = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
  link?: string;
};
```

## Save/Load with Stable IDs

Use helper functions to send stable mention IDs to backend and restore output for Editor.js.

```ts
import { encodeMentionsInOutput, decodeMentionsInOutput } from "@editorjs-mentions/plugin";

const nativeOutput = await editor.save();
const payloadForServer = encodeMentionsInOutput(nativeOutput);

// later when loading:
const payloadForEditor = decodeMentionsInOutput(payloadForServer);
```

Example serialized paragraph:

```json
{
  "type": "paragraph",
  "data": {
    "text": "@John Doe @Raj Patel",
    "entities": [
      {
        "type": "mention",
        "id": "u-1001",
        "displayName": "John Doe",
        "start": 0,
        "end": 9
      }
    ]
  }
}
```

## Dynamic Mention Styling

```ts
const mentions = new EditorJSMentions({
  holder: "editor",
  provider,
  mentionRenderContext: { currentUserId: "u-1002" },
  renderMention: ({ item, defaultText, element, context }) => {
    const ctx = context as { currentUserId?: string } | undefined;
    element.textContent = defaultText;
    element.style.fontWeight = ctx?.currentUserId === item.id ? "700" : "400";
  }
});

mentions.setMentionRenderContext({ currentUserId: "u-1001" });
mentions.refreshMentionRendering();
```

## REST Provider

Use built-in provider factory:

```ts
createRestMentionProvider({
  endpoint: "http://localhost:3001/api/mentions/users"
});
```

Expected endpoint example:

`GET /api/mentions/users?query=jo&trigger=@&limit=8`

## Clipboard Notes

- Copy/paste inside Editor.js keeps mention metadata.
- Pasting to external apps falls back to plain mention text (for example `@John Doe`).

## Public API

- `new EditorJSMentions(config)`
- `destroy()`
- `setMentionRenderContext(context: unknown)`
- `refreshMentionRendering()`
- `createRestMentionProvider(options)`
- `encodeMentionsInOutput(output)`
- `decodeMentionsInOutput(output)`

## Guidelines

This Editor.js plugin follows recommendations and guidelines provided by https://editorjs.io/.
