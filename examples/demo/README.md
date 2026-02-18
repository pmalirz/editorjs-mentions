# Demo

Runnable Vite demo for `editorjs-mentions`.

## Run

From repo root, in two terminals:

1. `npm run dev:server`
2. `npm run dev:demo`

Then open the URL printed by Vite (usually `http://localhost:5173`).

If you changed plugin exports and see browser import errors, restart demo with:

`npm run dev:demo -- --force`

## POC checklist

1. Type `@` in the editor and confirm dropdown opens.
2. Type `@jo` and verify server-side filtered results.
3. Use `ArrowUp`/`ArrowDown` and `Enter` to select.
4. Confirm mention chip is inserted and "Last selected" updates.
5. Click a mention chip to open the details tooltip.
6. Check serialized panel for `data.entities[]` containing mention `id`.
