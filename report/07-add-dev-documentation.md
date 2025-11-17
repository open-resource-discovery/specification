# Issue #07: No Developer Setup Documentation

**Priority:** HIGH
**Importance:** High
**Impact:** Medium
**Effort:** Low

## Problem Description

The repository lacks comprehensive developer onboarding documentation:
- No `DEVELOPMENT.md` or `DEVELOPERS.md` file
- README.md doesn't explain local development
- CONTRIBUTING.md is minimal (39 lines)
- No setup instructions
- No architecture overview
- No explanation of build process

New contributors face a **steep learning curve** to get started.

## Impact

**Contributor Experience:**
- Difficult to get started
- Time wasted figuring out setup
- Higher barrier to contribution
- Potential contributors give up

**Project Growth:**
- Fewer contributors
- Slower development
- More support questions
- Repeated explanations needed

**Maintenance:**
- Existing contributors forget steps
- Inconsistent development environments
- Hard to reproduce issues

## Current State

### README.md
- Explains what ORD is
- Links to published docs
- No local development info
- No build instructions

### CONTRIBUTING.md
- Only 39 lines
- Basic contribution guidelines
- No technical setup
- No development workflow

### Missing Information

1. **Prerequisites**
   - Node.js version requirements
   - npm version
   - OS compatibility
   - Optional tools

2. **Setup Instructions**
   - Clone repository
   - Install dependencies
   - First build
   - Run development server

3. **Development Workflow**
   - Making changes to schemas
   - Generating documentation
   - Building the site
   - Running locally

4. **Project Structure**
   - What's in /spec?
   - What's in /docs?
   - What's in /src?
   - Where are examples?

5. **Build System**
   - How does spec-toolkit work?
   - What gets generated?
   - Where do files go?
   - Why the postgenerate script?

6. **Common Tasks**
   - Adding a new example
   - Modifying a schema
   - Adding documentation
   - Testing changes

7. **Troubleshooting**
   - Common errors
   - How to get help
   - Where to ask questions

## Proposed Solution

Create comprehensive developer documentation in **DEVELOPMENT.md**.

### Recommended Structure

```markdown
# Development Guide

## Table of Contents
- Prerequisites
- Quick Start
- Project Structure
- Development Workflow
- Build System
- Common Tasks
- Testing
- Troubleshooting
- Architecture Overview

## Prerequisites

Required:
- Node.js >= 20.0.0
- npm >= 10.0.0

Recommended:
- VS Code with extensions:
  - [List recommended extensions]
- Git >= 2.x

OS: Works on macOS, Linux, and Windows (WSL recommended on Windows)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/open-resource-discovery/specification.git
cd specification

# Install dependencies
npm ci

# Generate schemas and documentation
npm run generate

# Build the documentation site
npm run build

# Start development server
npm start
# Open http://localhost:3000/specification
```

## Project Structure

```
specification/
├── spec/v1/              # Source schemas (YAML)
│   ├── Document.schema.yaml
│   ├── Configuration.schema.yaml
│   └── DocumentAPI.oas3.yaml
│
├── docs/                 # Documentation content
│   ├── spec-v1/         # Generated + manual docs
│   └── spec-extensions/ # Extension docs
│
├── src/                 # TypeScript source
│   ├── index.ts         # NPM package entry
│   ├── helper/          # Build scripts
│   ├── theme/           # Docusaurus customizations
│   └── generated/       # Generated (gitignored)
│
├── examples/            # Example files
│   ├── documents/       # ORD Document examples
│   ├── configuration/   # ORD Config examples
│   └── implementation/  # Full implementation examples
│
├── static/              # Static assets
│   ├── spec-v1/         # Generated schemas (published)
│   ├── img/             # Images and diagrams
│   └── css/             # Custom styles
│
└── dist/                # Compiled TypeScript (gitignored)
```

## Development Workflow

### Making Schema Changes

1. Edit source schema:
   ```bash
   vim spec/v1/Document.schema.yaml
   ```

2. Generate updated artifacts:
   ```bash
   npm run generate
   ```
   This creates:
   - JSON schemas in src/generated/
   - TypeScript types
   - Markdown documentation
   - Mermaid diagrams

3. Copy to destination:
   ```bash
   npm run postgenerate
   ```
   Or just run:
   ```bash
   npm run build
   ```

4. View changes:
   ```bash
   npm start
   ```

### Adding Documentation

1. Create or edit .md files in docs/
2. Update sidebars.js if adding new pages
3. Run npm start to preview
4. Build to verify: npm run build

### Adding Examples

1. Create example file:
   ```bash
   vim examples/documents/document-my-example.json
   ```

2. Follow naming convention:
   - ORD Documents: `document-*.json`
   - ORD Configs: `configuration-*.json`

3. Example will be automatically included in docs

## Build System

### Generation Pipeline

```
spec/v1/*.yaml
    ↓
[spec-toolkit]
    ↓
src/generated/
    ├── schemas/      (JSON Schema)
    ├── types/        (TypeScript)
    ├── docs/         (Markdown)
    └── plugin/       (UMS, diagrams)
    ↓
[postgenerate script]
    ↓
docs/spec-v1/interfaces/  (Documentation)
static/spec-v1/interfaces/ (Published schemas)
    ↓
[Docusaurus build]
    ↓
build/  (Static site)
```

### Key Scripts

- `npm run generate` - Run spec-toolkit
- `npm run postgenerate` - Copy generated files
- `npm run build-ts` - Compile TypeScript
- `npm run build-docusaurus` - Build site
- `npm run build` - All of the above
- `npm start` - Development server

## Common Tasks

### Adding a New Property to a Schema

1. Edit spec/v1/Document.schema.yaml
2. Add property definition
3. Run npm run generate
4. Check generated docs
5. Update examples if needed
6. Test build

### Creating a New Document Page

1. Create docs/your-page.md
2. Add frontmatter
3. Update sidebars.js
4. Run npm start
5. Verify navigation

### Testing Schema Changes

1. Validate against examples:
   ```bash
   # TODO: Add validation script
   ```
2. Build succeeds:
   ```bash
   npm run build
   ```
3. No TypeScript errors:
   ```bash
   npm run build-ts
   ```

## Troubleshooting

### Build Fails After Schema Change

- Check YAML syntax
- Ensure required fields present
- Review spec-toolkit output
- Check generated/error.log

### Development Server Won't Start

- Clear cache: rm -rf .docusaurus/
- Reinstall: rm -rf node_modules && npm ci
- Check port 3000 is available

### Generated Files Not Updating

- Run npm run generate manually
- Check spec-toolkit.config.json
- Verify source files changed
- Clear src/generated/ and regenerate

## Architecture Overview

### Specification Source

- YAML schemas are source of truth
- Located in spec/v1/
- JSON Schema Draft-07 format
- UMS overrides in Document.ums.yaml

### Generation Tool

- @open-resource-discovery/spec-toolkit
- Reads YAML, outputs multiple formats
- Plugins: UMS, Mermaid, Tabular
- Configured via spec-toolkit.config.json

### Documentation Site

- Docusaurus 3.x
- React-based static site
- Customized theme in src/theme/
- Mermaid diagram support

### NPM Package

- Exports JSON schemas
- Exports TypeScript types
- Published to @open-resource-discovery/specification
- Used by ORD consumers

## Getting Help

- GitHub Issues: Bug reports, feature requests
- GitHub Discussions: Q&A (if enabled)
- Code of Conduct: See CODE_OF_CONDUCT.md

## Next Steps

After setup:
1. Read the specification: docs/spec-v1/
2. Review examples: examples/documents/
3. Check open issues
4. Make your first contribution!
```

## Implementation Steps

1. **Create DEVELOPMENT.md** (2 hours)
   - Write comprehensive guide
   - Include all sections above
   - Add troubleshooting tips
   - Include architecture diagrams if helpful

2. **Enhance CONTRIBUTING.md** (1 hour)
   - Reference DEVELOPMENT.md
   - Add code review guidelines
   - Explain PR process
   - Link to development guide

3. **Update README.md** (30 minutes)
   - Add "Development" section
   - Link to DEVELOPMENT.md
   - Keep README focused on users
   - Move technical details to DEVELOPMENT.md

4. **Add VS Code Settings** (30 minutes)
   ```bash
   mkdir -p .vscode
   ```

   Create `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "files.exclude": {
       ".docusaurus": true,
       "node_modules": true,
       "dist": true,
       "build": true,
       "src/generated": true
     }
   }
   ```

   Create `.vscode/extensions.json`:
   ```json
   {
     "recommendations": [
       "esbenp.prettier-vscode",
       "dbaeumer.vscode-eslint",
       "redhat.vscode-yaml",
       "unifiedjs.vscode-mdx"
     ]
   }
   ```

## Expected Outcomes

After implementation:
- ✅ Clear development setup instructions
- ✅ Explained project structure
- ✅ Documented build process
- ✅ Common tasks covered
- ✅ Troubleshooting guide
- ✅ Faster contributor onboarding
- ✅ Fewer setup questions
- ✅ More consistent development environment

## Success Metrics

- New contributor can set up in < 15 minutes
- Build succeeds on first try
- Clear understanding of project structure
- Fewer "how do I..." questions
- More contributions from new developers

## Related Issues

- Complements: #02 (Testing docs)
- Complements: #03 (Linting setup)
- Improves: #13 (Architecture docs)

## Files to Create

- `DEVELOPMENT.md` (main development guide)
- `.vscode/settings.json` (optional but recommended)
- `.vscode/extensions.json` (optional but recommended)

## Files to Modify

- `README.md` (add development section, link to DEVELOPMENT.md)
- `CONTRIBUTING.md` (enhance with references to DEVELOPMENT.md)

---

## Agent Prompt

```
Create comprehensive developer documentation for the ORD specification repository.

Context:
- Repository lacks setup instructions for new contributors
- No explanation of project structure or build system
- Contributors waste time figuring out how to get started
- Need to lower the barrier to contribution

Tasks:
1. Create DEVELOPMENT.md with:
   - Prerequisites (Node.js 20+, npm 10+)
   - Quick start guide (clone, install, build, run)
   - Project structure explanation (spec/, docs/, src/, examples/)
   - Development workflow (how to make changes)
   - Build system overview (spec-toolkit → generation → build)
   - Common tasks with examples:
     * Modifying schemas
     * Adding documentation
     * Creating examples
     * Testing changes
   - Troubleshooting section
   - Architecture overview

2. Enhance CONTRIBUTING.md:
   - Reference DEVELOPMENT.md for setup
   - Add code review guidelines
   - Explain PR process
   - Add commit message guidelines

3. Update README.md:
   - Add "Development" section
   - Link to DEVELOPMENT.md
   - Keep README focused on users, move technical details

4. Create .vscode/settings.json (optional):
   - Format on save
   - Hide generated directories
   - Recommended extensions

5. Create .vscode/extensions.json (optional):
   - List recommended VS Code extensions

Make it:
- Clear and concise
- Step-by-step for beginners
- Include command examples
- Cover common pitfalls
- Easy to follow

Expected outcome:
- New contributor can set up and build in < 15 minutes
- Clear understanding of project structure
- Documented build process
- Common tasks explained
- Troubleshooting guide available
```
