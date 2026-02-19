# Contributing to Editor.js Mentions

Thank you for your interest in contributing! We welcome bug reports, feature requests, and pull requests.

## Getting Started

1.  **Fork** the repository.
2.  **Clone** your fork.
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Create a branch** for your feature or fix.

## Development

The project is a monorepo managed by npm workspaces.

-   **Plugin**: `packages/editorjs-mentions`
-   **Server Example**: `examples/server`
-   **Demo**: `examples/demo`

### Scripts

-   `npm run build`: Build all packages.
-   `npm run dev:plugin`: Watch mode for the plugin.
-   `npm run dev:demo`: Run the demo application.
-   `npm run dev:server`: Run the example server.
-   `npm test`: Run tests.
-   `npm run lint`: Lint the code.
-   `npm run format`: Format the code.

## Coding Standards

-   We use **ESLint** and **Prettier** for linting and formatting.
-   Please run `npm run lint` and `npm run format` before submitting.
-   Write tests for new features or bug fixes.

## Pull Requests

1.  Ensure all tests pass.
2.  Update documentation if needed.
3.  Describe your changes clearly in the PR description.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
