# editorjs-mentions

[![Last Commit](https://img.shields.io/github/last-commit/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions)
[![npm latest](https://img.shields.io/npm/v/%40editorjs-mentions%2Fplugin/latest?style=flat-square)](https://www.npmjs.com/package/@editorjs-mentions/plugin)
[![License](https://img.shields.io/github/license/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/blob/main/LICENSE)
[![Open Issues](https://img.shields.io/github/issues/pmalirz/editorjs-mentions?style=flat-square)](https://github.com/pmalirz/editorjs-mentions/issues)
[![Editor.js 2.x](https://img.shields.io/badge/Editor.js-2.x-0ea5e9?style=flat-square)](https://www.npmjs.com/package/@editorjs/editorjs)

`editorjs-mentions` is a monorepo containing an Editor.js plugin that enables mention-style autocomplete (similar to JIRA/Confluence) and example applications.

![Mentions usage demo](docs/mentions-usage-example.gif)

## Packages

-   **Plugin**: [`packages/editorjs-mentions`](./packages/editorjs-mentions) - The main plugin package.
-   **Server Example**: [`examples/server`](./examples/server) - Sample REST backend (Express + TypeScript).
-   **Demo**: [`examples/demo`](./examples/demo) - Minimal integration example.

## Getting Started

To start developing or running examples:

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Build packages**:
    ```bash
    npm run build
    ```

3.  **Run Sample Server**:
    ```bash
    npm run dev:server
    ```

4.  **Run Demo App**:
    ```bash
    npm run dev:demo
    ```

## Plugin Documentation

For detailed installation and usage instructions of the plugin, please refer to the [Plugin README](./packages/editorjs-mentions/README.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

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
   - `npm test`
4. Commit changed files (`packages/editorjs-mentions/package.json`, `package-lock.json`).
5. Create tag/release (for GitHub Actions publish workflow).

## License

MIT (`LICENSE`).
