# claritas-viz.github.io

GitHub Pages landing site for **Claritas** — a columnar analytics engine that turns raw records into clear pictures and full presentations.

Served at <https://claritas-viz.github.io> from the `main` branch root. See [AGENTS.md](AGENTS.md) for repository rules.

## Public intake routes

- `/get-started/` routes visitors to the correct form.
- `/quote/` submits project quote requests.
- `/pre-interest/` registers early interest.
- `/apply/` submits formal applications.

The forms send credential-free JSON to the origin embedded at build time through
`PUBLIC_CLARITAS_API_BASE_URL`. Leave the variable empty in unconfigured builds;
the browser will fail closed with a visible status message instead of guessing a
production hostname. Public variables must never contain tokens or other secrets.

## Verification

```bash
npm ci
npm run build
npm test
npm run test:e2e
npm run test:puppeteer
```
