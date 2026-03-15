# Model Auth V1

Model Auth V1 audits claimed model identity for API endpoints and returns an evidence-backed risk verdict.

## Features

1. Provider adapters (`openai_compatible`, `anthropic`, `gemini`, `azure_openai`, `custom` placeholder).
2. Four-stage evaluation pipeline (protocol, capability, MET-style check, volatility).
3. Scoring + red-flag verdict engine.
4. UI pages for configuration and report viewing.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000/config`.

## Verification

```bash
npm run verify
```

This runs unit tests, type checking, and production build.

## Deploy to Railway

```bash
railway init -n model-auth-v1
railway up
railway domain
```

If your project is already created, run:

```bash
railway link
railway up
```
