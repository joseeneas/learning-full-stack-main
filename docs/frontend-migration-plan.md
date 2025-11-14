# Frontend Migration Plan: CRA (react-scripts) → Vite

## Goals

- Reduce transitive vulnerabilities stemming from legacy `react-scripts` toolchain
- Speed up dev server and build times with Vite
- Keep React, Ant Design, Recharts, and app code behaviorally identical

## Scope (Minimal viable migration)

- Replace `react-scripts` with Vite (no UI/feature changes)
- Keep testing with Jest/RTL initially, or migrate to Vitest in a follow-up
- Preserve current public assets and environment variable behavior

## Approach Options

1) Direct Vite Migration (recommended)
   - Add `vite` and supporting plugins: `@vitejs/plugin-react`
   - Create `vite.config.js` for base path `/` and dev proxy to backend (`/api` → `http://localhost:8080`)
   - Move `public/index.html` to project `index.html` (Vite root) and update root div id
   - Update NPM scripts: `dev`, `build`, `preview`
   - Adjust imports for CSS/assets if needed (Vite handles assets differently from CRA)
   - Update environment variables to `VITE_` prefix where used in FE code

2) CRA ecosystem bumps (temporary)
   - Attempt targeted dependency updates within CRA constraints
   - May not fully eliminate audit issues; provides short-term mitigation only

## Detailed Tasks (Option 1)

1. Dependencies
   - Remove `react-scripts`
   - Add: `vite`, `@vitejs/plugin-react`
   - Optional (later): `vitest`, `@testing-library/react`, `@testing-library/jest-dom`

2. Config & Structure
   - Add `vite.config.js` with dev server proxy:
     - Proxy `/api` → `http://localhost:8080`
   - Move `public/index.html` to root `index.html` (use `%s` replacements → Vite HTML syntax if needed)
   - Ensure static assets (favicon, manifest) are referenced correctly

3. NPM Scripts
   - `"dev": "vite"`
   - `"build": "vite build"`
   - `"preview": "vite preview"`
   - Remove `react-scripts` commands

4. Env Vars
   - Replace usages of `process.env.REACT_APP_*` with `import.meta.env.VITE_*`
   - Update `.env` naming to use `VITE_` prefix

5. Testing (phase 2)
   - Keep Jest temporarily if needed; or migrate to Vitest for faster iteration
   - Map aliases if required

6. Verification
   - `npm run dev`: FE dev server runs and proxies to backend on 8080
   - `./mvnw verify`: FE build via Maven still works (if wired) or use separate FE build
   - Manually test key flows: Dashboard (stats + click-to-filter), Reports (paging, filters, CSV export)

## Rollout Plan

1. Work on branch `V1.0`
2. Keep commits small and focused (config → scripts → env → polish)
3. Open PR with test instructions; run full `./mvnw verify`
4. After approval, squash-merge and tag `v1.0.0`

## Risks & Mitigations

- Env variables not mapped (build/runtime mismatch)
  - Audit usages; add migration notes; verify in both dev and prod build
- Asset paths or index.html differences
  - Use dev server preview and production `vite preview` to validate
- Jest/Vitest differences
  - Keep Jest first; migrate tests in a follow-up PR if needed

## Acceptance Criteria

- App compiles and runs with Vite in dev and prod
- No regressions in filters, paging, CSV export
- Integration tests remain green (`./mvnw verify`)
