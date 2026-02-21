# editorjs-mentions

[![Last Commit](https://img.shields.io/github/last-commit/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions)
[![npm latest](https://img.shields.io/npm/v/%40editorjs-mentions%2Fplugin/latest?style=flat-square)](https://www.npmjs.com/package/@editorjs-mentions/plugin)
[![License](https://img.shields.io/github/license/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/blob/main/LICENSE)
[![Open Issues](https://img.shields.io/github/issues/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/issues)
[![Editor.js 2.x](https://img.shields.io/badge/Editor.js-2.x-0ea5e9?style=flat-square)](https://www.npmjs.com/package/@editorjs/editorjs)

`editorjs-mentions` is an Editor.js plugin that enables mention-style autocomplete (similar to JIRA/Confluence).

![Mentions usage demo](docs/mentions-usage-example.gif)

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

## Development

Run linting:

```bash
npm run lint
```

Run tests:

```bash
npm test --workspace @editorjs-mentions/plugin
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

For quick local LDAP testing with Docker, see `examples/server/README.md`.

Shortcuts:

- `npm run dev:ldap:up`
- `npm run dev:ldap:down`

## Release & Publish

Only plugin package version needs bumping.

Recommended flow:

1. Bump plugin version:
   - patch: `npm run version:plugin:patch`
   - minor: `npm run version:plugin:minor`
   - major: `npm run version:plugin:major`
2. Refresh lockfile:
   - `npm install`
3. Verify:
   - `npm run typecheck --workspace @editorjs-mentions/plugin`
   - `npm run build --workspace @editorjs-mentions/plugin`
4. Commit changed files (`packages/editorjs-mentions/package.json`, `package-lock.json`).
5. Create tag/release (for GitHub Actions publish workflow).

Notes:

- `examples/demo` uses local dependency (`file:../../packages/editorjs-mentions`) so demo version does not require manual sync.
- Root package is private and does not require release version bump.

License: MIT (`LICENSE`).

## GitHub Actions

- CI build workflow: `.github/workflows/ci.yml`
- npm publish workflow: `.github/workflows/publish-npm.yml`

For npm publish workflow, configure repository secret:

- `NPM_TOKEN` - npm automation token with publish permissions for `@editorjs-mentions/plugin`.
