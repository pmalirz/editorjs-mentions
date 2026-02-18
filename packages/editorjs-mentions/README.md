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
  provider: createRestMentionProvider({
    endpoint: "http://localhost:3001/api/mentions/users"
  })
});

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

## Data Model

```ts
type MentionItem = {
  id: string;
  displayName: string;
  description?: string;
  image?: string;
};
```

