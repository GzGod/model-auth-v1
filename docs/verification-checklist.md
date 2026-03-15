# Verification Checklist

## Pre-merge Gate

1. `npm run test` passes with zero failures.
2. `npm run lint` passes with zero type errors.
3. `npm run build` succeeds.
4. `npm run verify` succeeds end-to-end.

## Functional Smoke

1. Create run from `/config`.
2. Open generated `/runs/{runId}` report.
3. Confirm verdict score, flags, and evidence render.
