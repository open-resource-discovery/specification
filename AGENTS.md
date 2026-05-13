# Agent Context for ORD Specification

Open Resource Discovery (ORD) is a protocol specification that enables applications and services to self-describe their exposed resources and capabilities. This repository contains the JSON Schema specification, TypeScript types, and documentation website (Docusaurus) published at https://open-resource-discovery.org.

## Critical Rules

- **Git**: Never push to `main` or merge locally into `main` - use PRs only (pre-push hook enforced)
- **Generated files**: Never edit `src/generated/`, `dist/`, `build/`, or `static/spec-v1/interfaces/` - always edit sources in `spec/v1/*.schema.yaml` or `docs/`
- **Pre-commit**: Hook automatically runs `npm run generate` and stages generated files

## Architecture Note

YAML schemas in `spec/v1/*.schema.yaml` → `npm run generate` → outputs to `src/generated/`, `dist/`, `static/spec-v1/interfaces/`

## Verify Loop (before committing)

```bash
npm run build     # Build TS + Docusaurus + validate
npm run lint      # Linting
npm run test      # Tests
```

Note: `npm run generate` runs automatically via pre-commit hook.

**Common build failures:**
- Broken links (Docusaurus validates all internal links)
- TypeScript errors (generated types mismatch)

## Skills

- `/release` - Release automation from `release/vX.Y.Z` branches
