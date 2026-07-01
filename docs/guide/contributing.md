---
title: Contributing
description: How to set up sDeck for local development, run lint/tests, and submit a pull request.
---

# Contributing

sDeck is a small self-hosted project with an intentionally lightweight contribution process. Full details live in [CONTRIBUTING.md](https://github.com/itsiurisilva/sDeck/blob/main/CONTRIBUTING.md) on GitHub — the short version:

```bash
git clone https://github.com/itsiurisilva/sDeck.git
cd sDeck
npm install
cp .env.example .env
npm start
```

Before opening a PR:

```bash
npm run lint   # ESLint over server.js, public/js, and lib/
npm test       # node --test, covers lib/validators.js
```

Both must pass. There's no build step or framework — plain Express on the backend, vanilla JS/CSS on the frontend — and PRs should stay focused on one fix or feature at a time.

This project follows a [Code of Conduct](https://github.com/itsiurisilva/sDeck/blob/main/CODE_OF_CONDUCT.md), and is released under the [MIT License](https://github.com/itsiurisilva/sDeck/blob/main/LICENSE).
