# Contributing to sDeck

Thanks for considering a contribution! sDeck is a small self-hosted project, so the process is intentionally lightweight.

## Getting set up

```bash
git clone https://github.com/itsiurisilva/sDeck.git
cd sDeck
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000` — the app generates `config/settings.json` and `config/profiles.json` on first run.

## Before opening a PR

```bash
npm run lint   # ESLint over server.js, public/js, and lib/
npm test       # node --test, covers lib/validators.js
```

Both must pass. If you touch `public/index.html`, `public/css/style.css`, or `public/js/app.js`, please sanity-check the change in a browser at a few widths (desktop and a phone-sized viewport) — a fair amount of this codebase's history is fixing things that only broke on mobile.

## Making changes

- Keep PRs focused — one fix or feature per PR is easier to review than a bundle of unrelated changes.
- Match the existing style: no build step, no framework — plain Express on the backend and vanilla JS/CSS on the frontend.
- If you're adding a new button action type or widget, wire it up in both `public/index.html` (the editor form) and `public/js/app.js` (the handler), and document it in the README's [Button Actions & Widgets](README.md#-button-actions--widgets) table.
- Don't commit `config/settings.json`, `config/profiles.json`, or anything else under `config/` other than the `.example` files — those hold your personal API keys and deck layout.

## Reporting bugs / requesting features

Use the issue templates — they ask for just enough detail (steps to reproduce, environment) to act on a report without back-and-forth.

## License

By contributing, you agree your contribution is licensed under the project's [MIT License](LICENSE).
