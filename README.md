# folio

Portfolio app for **Jake Amponsah** (multi-disciplinary designer based in Accra, Ghana).

## Requirements

- Node.js (LTS recommended)

## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

By default, the dev server runs with:

- Host: `0.0.0.0`
- Port: `3000`

## Development scripts

- Start dev server: `npm run dev`
- Typecheck (no emit): `npm run lint`

## Build

Create a production build:

```bash
npm run build
```

## Preview production build

Serve the production build locally:

```bash
npm run preview
```

## Clean

Remove build output (if present):

```bash
npm run clean
```

## Deploy

This project is a Vite app. For most static hosts (Vercel/Netlify/etc.), use:

1. `npm install`
2. `npm run build`

Then serve the generated `dist/` directory.
