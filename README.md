# editorjs-mentions

[![Last Commit](https://img.shields.io/github/last-commit/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions)
[![npm latest](https://img.shields.io/npm/v/%40editorjs-mentions%2Fplugin/latest?style=flat-square)](https://www.npmjs.com/package/@editorjs-mentions/plugin)
[![License](https://img.shields.io/github/license/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/blob/main/LICENSE)
[![Open Issues](https://img.shields.io/github/issues/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/issues)
[![Editor.js 2.x](https://img.shields.io/badge/Editor.js-2.x-0ea5e9?style=flat-square)](https://www.npmjs.com/package/@editorjs/editorjs)

`editorjs-mentions` is an Editor.js plugin that enables mention-style autocomplete (similar to JIRA/Confluence).

![Mentions usage demo](docs/mentions-usage-example.gif)

## Packages

- **[@editorjs-mentions/plugin](packages/editorjs-mentions)**: The Editor.js plugin.
- **[examples/server](examples/server)**: Sample REST backend (Express + TypeScript).
- **[examples/demo](examples/demo)**: Minimal integration example.

## Quick Start

See [packages/editorjs-mentions/README.md](packages/editorjs-mentions/README.md) for plugin installation and usage.

To run the project locally:

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

## Active Directory Example

See `examples/server/README.md` for details on running the optional LDAP-backed example.

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
