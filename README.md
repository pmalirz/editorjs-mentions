# editorjs-mentions

`editorjs-mentions` is an Editor.js plugin that enables mention-style autocomplete (similar to JIRA/Confluence).

## Features

- Trigger autocomplete with `@` (or custom trigger symbols).
- Pluggable provider API for mention data.
- Standard mention model:
  - `id: string`
  - `displayName: string`
  - `description?: string`
  - `image?: string`
  - `link?: string`
- Sample REST server with:
  - in-memory demo users
  - Active Directory-backed example provider

## Monorepo Layout

- `packages/editorjs-mentions`: plugin package (TypeScript)
- `examples/server`: sample REST backend (Express + TypeScript)
- `examples/demo`: minimal integration example

## Quick Start

```bash
npm install
npm run build
```

Run sample server:

```bash
npm run dev:server
```

Run demo app:

```bash
npm run dev:demo
```

## Plugin Usage

```ts
import EditorJS from "@editorjs/editorjs";
import { EditorJSMentions, createRestMentionProvider } from "@editorjs-mentions/plugin";

const editor = new EditorJS({
  holder: "editor"
});

await editor.isReady;

const mentions = new EditorJSMentions({
  holder: "editor",
  triggerSymbols: ["@"],
  mentionRenderContext: { currentUserDisplayName: "Joanna Smith" },
  renderMention: ({ item, defaultText, element, context }) => {
    const ctx = context as { currentUserDisplayName?: string } | undefined;
    element.textContent = defaultText;
    element.style.fontWeight = ctx?.currentUserDisplayName === item.displayName ? "700" : "400";
  },
  provider: createRestMentionProvider({
    endpoint: "http://localhost:3001/api/mentions/users"
  })
});

mentions.setMentionRenderContext({ currentUserDisplayName: "John Doe" });

// later:
// mentions.destroy();
```

## Mention Provider Contract

The plugin consumes this model:

```ts
type MentionItem = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
  link?: string;
};
```

## Persisting Mention IDs

Use `encodeMentionsInOutput(editor.save())` to convert display HTML into structured entities:

```json
{
  "type": "paragraph",
  "data": {
    "text": "@John Doe @Raj Patel",
    "entities": [
      { "type": "mention", "id": "u-1001", "displayName": "John Doe", "start": 0, "end": 9 }
    ]
  }
}
```

Providers implement:

```ts
type MentionProvider = (query: {
  trigger: string;
  query: string;
  limit: number;
}) => Promise<MentionItem[]>;
```

or:

```ts
interface MentionProviderObject {
  search(query: MentionQuery): Promise<MentionItem[]>;
}
```

## REST API Example

`GET /api/mentions/users?query=jo&trigger=@&limit=8`

Response:

```json
{
  "items": [
    {
      "id": "u-1001",
      "displayName": "John Doe",
      "description": "Engineering",
      "image": "https://..."
    }
  ]
}
```

## Active Directory Example

See `examples/server/.env.example` and set:

- `AD_ENABLED=true`
- `AD_URL`
- `AD_BIND_DN`
- `AD_BIND_PASSWORD`
- `AD_BASE_DN`

When enabled, the server switches to LDAP-backed lookup.
