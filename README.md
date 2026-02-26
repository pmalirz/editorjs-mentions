# editorjs-mentions

[![Last Commit](https://img.shields.io/github/last-commit/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions)
[![npm latest](https://img.shields.io/npm/v/%40editorjs-mentions%2Fplugin/latest?style=flat-square)](https://www.npmjs.com/package/@editorjs-mentions/plugin)
[![License](https://img.shields.io/github/license/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/blob/main/LICENSE)
[![Open Issues](https://img.shields.io/github/issues/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/issues)
[![Editor.js 2.x](https://img.shields.io/badge/Editor.js-2.x-0ea5e9?style=flat-square)](https://www.npmjs.com/package/@editorjs/editorjs)

`editorjs-mentions` is an Editor.js plugin that enables mention-style autocomplete (similar to JIRA/Confluence).

![Mentions usage demo](packages/editorjs-mentions/docs/mentions-usage-example.gif)

## Packages

- **[@editorjs-mentions/plugin](packages/editorjs-mentions)**: The core Editor.js plugin. See [README](packages/editorjs-mentions/README.md) for usage instructions.
- **[@editorjs-mentions/example-server](examples/server)**: Sample REST backend (Express + TypeScript) with optional LDAP support. See [README](examples/server/README.md).
- **[@editorjs-mentions/example-demo](examples/demo)**: Minimal integration example using Vite.

## Monorepo Layout

This repository is managed as an npm workspace.

- `packages/editorjs-mentions`: plugin package (TypeScript)
- `examples/server`: sample REST backend
- `examples/demo`: frontend demo app

## Quick Start (Development)

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Build packages**:
    ```bash
    npm run build
    ```

3.  **Run development tasks**:

    -   Linting: `npm run lint`
    -   Tests: `npm run test --workspace @editorjs-mentions/plugin`
    -   Sample server: `npm run dev:server`
    -   Demo app: `npm run dev:demo`

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

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
