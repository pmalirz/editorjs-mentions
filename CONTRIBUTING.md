# Contributing to Editor.js Mentions

Thank you for your interest in contributing! We welcome bug reports, feature requests, and pull requests.

## Development

1.  **Fork and Clone**: Fork the repository and clone it locally.
2.  **Install Dependencies**: Run `npm install` in the root directory.
3.  **Monorepo Structure**:
    *   `packages/editorjs-mentions`: The core plugin.
    *   `examples/server`: A sample backend server.
    *   `examples/demo`: A frontend demo app.

## Coding Standards

We use ESLint and Prettier to maintain code quality.

*   **Lint**: Run `npm run lint` to check for linting errors.
*   **Format**: Run `npm run format` to auto-format code.
*   **Typecheck**: Run `npm run typecheck --workspaces` to ensure type safety.

## Testing

Please ensure all tests pass before submitting a PR.

*   **Run Tests**: Run `npm run test --workspace @editorjs-mentions/plugin` to run plugin tests.
*   **Add Tests**: If you add a new feature or fix a bug, please add a corresponding test case.

## Submitting Changes

1.  Create a new branch for your feature or fix.
2.  Commit your changes with descriptive messages.
3.  Push your branch to your fork.
4.  Open a Pull Request against the `main` branch.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
