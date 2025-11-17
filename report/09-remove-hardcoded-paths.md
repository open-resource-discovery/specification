# Issue #09: Hardcoded Paths in Build Scripts

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Medium
**Effort:** Low

## Problem

`src/helper/copyGeneratedToDestination.ts` contains hardcoded file paths:
```typescript
await fs.copy("./src/generated/spec/v1/docs/Configuration.md", "docs/spec-v1/interfaces/Configuration.md");
await fs.copy("./src/generated/spec/v1/docs/Document.md", "docs/spec-v1/interfaces/Document.md");
```

Issues:
- Difficult to maintain
- Error-prone when adding new docs
- Not DRY (repeated paths)
- Hard to test
- Breaks if directory structure changes

## Solution

Extract paths to configuration:

```typescript
// config/paths.ts
export const PATHS = {
  generated: {
    base: './src/generated/spec/v1',
    docs: './src/generated/spec/v1/docs',
    schemas: './src/generated/spec/v1/schemas',
    plugin: {
      ums: './src/generated/spec/v1/plugin/ums',
      mermaid: './src/generated/spec/v1/plugin/mermaidDiagram',
    },
  },
  destination: {
    docsInterfaces: 'docs/spec-v1/interfaces/',
    docsExamples: 'docs/spec-v1/examples/',
    docsDiagrams: 'docs/spec-v1/diagrams/',
    staticSchemas: 'static/spec-v1/interfaces/',
    staticUms: 'static/spec-v1/interfaces/ums/',
  },
  source: {
    specs: './spec/v1/',
  },
};

// Use in copyGeneratedToDestination.ts
import { PATHS } from '../../config/paths';

const operations = [
  { from: `${PATHS.generated.docs}/Configuration.md`, to: `${PATHS.destination.docsInterfaces}/Configuration.md` },
  { from: `${PATHS.generated.docs}/Document.md`, to: `${PATHS.destination.docsInterfaces}/Document.md` },
  // ...
];

for (const { from, to } of operations) {
  await fs.copy(from, to);
}
```

---

## Agent Prompt

```
Refactor copyGeneratedToDestination.ts to remove hardcoded paths and improve maintainability.

Tasks:
1. Create config/paths.ts with all path constants
2. Refactor copyGeneratedToDestination.ts to use constants
3. Make copy operations data-driven (loop over array)
4. Add error handling for each operation
5. Add logging for better debugging
6. Update imports and exports

Expected outcome:
- No hardcoded paths
- Easier to maintain
- Better error messages
- More testable code
```
