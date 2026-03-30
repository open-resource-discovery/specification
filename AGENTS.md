# Agent Documentation

This file documents the ORD specification project structure and available agent skills for automation.

## Project Overview

**Open Resource Discovery (ORD)** is a protocol that enables applications and services to self-describe their exposed resources and capabilities. This repository contains:

- **ORD specification** (JSON Schema) - defines the structure of ORD documents
- **Documentation website** (Docusaurus) - human-readable specification at https://open-resource-discovery.org
- **TypeScript types** - generated from JSON Schema for use in TypeScript projects
- **NPM package** - `@open-resource-discovery/specification`

## Important: Generated Files

**Key concept**: Many files in this repository are auto-generated from source files. Always edit the source, not the generated output.

### Source Files (edit these)
- `spec/v1/Document.schema.yaml` - ORD Document JSON Schema (source of truth)
- `spec/v1/Configuration.schema.yaml` - ORD Configuration JSON Schema
- Markdown files in `docs/` - documentation content

### Generated Files (do not edit directly)
- `src/generated/` - TypeScript types, markdown docs, diagrams
- `dist/` - compiled JavaScript and TypeScript declarations
- `build/` - static website build
- `static/spec-v1/interfaces/` - published JSON Schemas

**To regenerate after editing source files:**
```bash
npm run generate
```

## Development Workflow

### Branch and PR Rules

> **CRITICAL**: The following rules MUST be followed without exception.

- **NEVER push directly to `main`**. The `main` branch is protected and only receives changes via merged PRs.
- **NEVER merge a branch into `main` using git** (no `git merge`, no `git rebase` onto main). Merging into `main` happens exclusively through the GitHub UI as part of the release process (see the `/release` skill).
- **All work MUST happen on a dedicated branch** (e.g. `feat/my-change`, `fix/my-fix`). Create a branch before making any commits.
- **Changes reach `main` only via Pull Requests**, reviewed and merged through GitHub.

Typical branch workflow:
```bash
git checkout -b feat/my-change
# ... make changes, run generate, run tests ...
git add -A
git commit -m "feat: describe what changed"
git push origin feat/my-change
# Then open a PR on GitHub — do NOT merge locally
```

### Essential npm Scripts

```bash
# Generate all artifacts from source schemas
npm run generate

# Build everything (generate + TypeScript + website)
npm run build

# Run tests
npm run test

# Start local dev server (hot reload)
npm start

# Format code
npm run format

# Lint code
npm run lint
```

### Verify Loop (before committing)

1. **Edit source files** (YAML schemas, docs)
2. **Regenerate**: `npm run generate`
3. **Build**: `npm run build`
   - Compiles TypeScript
   - Builds Docusaurus website
   - Validates schemas
   - Checks for broken links
4. **Test**: `npm run test`
5. **Review changes**: Check both source and generated files
6. **Commit**: Include both source and generated files

**Common build errors:**
- **Broken links** - Docusaurus validates all internal links
- **TypeScript errors** - Check generated types match schema
- **Missing files** - Run `npm run generate` first

## Available Skills

### `/release` - Release Process

Comprehensive checklist for releasing a new ORD specification version.

**When to use:** Preparing to release from a `release/vX.Y.Z` branch.

**What it verifies:**
- Version consistency (package.json, CHANGELOG.md, branch name)
- All PRs documented in CHANGELOG.md
- `x-introduced-in-version` markers on new schema properties
- Build and tests pass
- No uncommitted changes

**What it does:**
- Fixes incorrect version markers
- Creates PR to main
- Guides through GitHub Actions automated release

**Usage:**
```
/release
```

See [.claude/skills/release.md](.claude/skills/release.md) for detailed documentation.

## Project Structure

```
.
├── spec/v1/                    # Source JSON Schemas (YAML)
│   ├── Document.schema.yaml    # Main ORD Document schema
│   └── Configuration.schema.yaml
├── docs/                       # Documentation source (markdown)
├── src/                        # TypeScript source + helpers
│   ├── generated/              # Generated TypeScript types
│   └── helper/                 # Build scripts
├── static/                     # Static assets for website
├── build/                      # Built website (generated)
└── dist/                       # Built npm package (generated)
```

## Links

- **Website**: https://open-resource-discovery.org
- **NPM**: https://www.npmjs.com/package/@open-resource-discovery/specification
- **Issues**: https://github.com/open-resource-discovery/specification/issues

