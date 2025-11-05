---
description: Build the entire project (generate, TypeScript, and Docusaurus site)
---

Run `npm run build` to build the entire project.

This command executes:
1. `npm run generate` - Generate types from YAML schemas
2. `npm run build-ts` - Compile TypeScript
3. `npm run build-docusaurus` - Build the documentation site

The output will be in:
- `dist/` - npm package distribution files
- `build/` - Static documentation site

Review the output for any errors or warnings. If the build fails, check:
- YAML schema validity in `spec/v1/`
- TypeScript compilation errors
- Documentation markdown syntax
