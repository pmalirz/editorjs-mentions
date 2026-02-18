# @editorjs-mentions/plugin

[![Last Commit](https://img.shields.io/github/last-commit/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions)
[![npm latest](https://img.shields.io/npm/v/%40editorjs-mentions%2Fplugin/latest?style=flat-square)](https://www.npmjs.com/package/@editorjs-mentions/plugin)
[![npm next](https://img.shields.io/npm/v/%40editorjs-mentions%2Fplugin/next?style=flat-square)](https://www.npmjs.com/package/@editorjs-mentions/plugin)
[![License](https://img.shields.io/github/license/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/blob/main/LICENSE)
[![Open Issues](https://img.shields.io/github/issues/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/issues)
[![Editor.js 2.x](https://img.shields.io/badge/Editor.js-2.x-0ea5e9?style=flat-square)](https://www.npmjs.com/package/@editorjs/editorjs)

Mentions autocomplete plugin for Editor.js with:

- configurable trigger symbols
- pluggable provider API
- structured mention serialization (`text + entities`) for stable backend IDs
- mention tooltip with optional link
- metadata-preserving copy/paste in Editor.js

![Mentions autocomplete example](docs/mentions-example-autocomplete.png)

## Install

```bash
npm i @editorjs-mentions/plugin
```

## Quick Start

```ts
import { EditorJSMentions, createRestMentionProvider } from "@editorjs-mentions/plugin";

const mentions = new EditorJSMentions({
  holder: "editor",
  triggerSymbols: ["@"],
  mentionRenderContext: { currentUserId: "u-1002" },
  renderMention: ({ item, defaultText, element, context }) => {
    const ctx = context as { currentUserId?: string } | undefined;
    const isCurrentUser = ctx?.currentUserId === item.id;
    element.textContent = defaultText;
    element.style.fontWeight = isCurrentUser ? "700" : "400";
  },
  provider: createRestMentionProvider({
    endpoint: "http://localhost:3001/api/mentions/users"
  })
});

mentions.setMentionRenderContext({ currentUserId: "u-1001" });

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
- `renderItem?: (item) => string` - custom item renderer.
- `renderMention?: (args) => void` - customize rendered mention anchor (style/content/classes).
- `mentionRenderContext?: unknown` - dynamic context available in `renderMention`.

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

## Save/Load with Stable IDs

Serialize editor output before sending to backend:

```ts
import { encodeMentionsInOutput, decodeMentionsInOutput } from "@editorjs-mentions/plugin";

const nativeOutput = await editor.save();
const payloadForServer = encodeMentionsInOutput(nativeOutput);

// later when loading existing content:
const payloadFromServer = await fetch(...).then((r) => r.json());
const payloadForEditor = decodeMentionsInOutput(payloadFromServer);
```

Example stored paragraph:

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
        "end": 9,
        "description": "Engineering",
        "link": "https://example.local/users/u-1001"
      }
    ]
  }
}
```

## Runtime Styling Updates

Use ID-based context and re-render mentions when app state changes:

```ts
mentions.setMentionRenderContext({ currentUserId: loggedUser.id });
mentions.refreshMentionRendering();
```

`renderMention` receives:

```ts
{
  item: MentionItem;              // full mention metadata (id, displayName, ...)
  trigger: string;                // matched trigger, e.g. "@"
  defaultText: string;            // default visible text, e.g. "@John Doe"
  element: HTMLAnchorElement;     // mention DOM element to customize
  source: "insert" | "paste" | "refresh";
  context?: unknown;              // mentionRenderContext passed by app
}
```

## Clipboard Notes

- In-editor copy/paste keeps mention structure via custom clipboard payload + HTML normalization.
- Pasting into external apps falls back to plain text representation (for example `@John Doe`).

## Public API

- `new EditorJSMentions(config)`
- `destroy()`
- `setMentionRenderContext(context: unknown)`
- `refreshMentionRendering()`
- `createRestMentionProvider(options)`
- `encodeMentionsInOutput(output)`
- `decodeMentionsInOutput(output)`
