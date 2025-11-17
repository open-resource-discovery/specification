# Issue #12: Generated Files Copied Instead of Symlinked

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Low
**Effort:** Medium

## Problem

Generated files are **copied** from `src/generated/` to `docs/` and `static/`:
- Creates duplication
- Files can become stale
- Hard to track what's source vs generated
- Increases repository size

## Current Approach

```typescript
// copyGeneratedToDestination.ts
await fs.copy("./src/generated/spec/v1/docs/Configuration.md", "docs/spec-v1/interfaces/Configuration.md");
```

Problems:
- Two copies of same file
- If generation fails, old copy remains
- Not obvious which is canonical
- Git tracks both copies

## Alternative Approaches

### Option 1: Symbolic Links

```bash
ln -s ../../src/generated/spec/v1/docs/Configuration.md docs/spec-v1/interfaces/Configuration.md
```

Pros:
- Single source of truth
- Always in sync
- Smaller repo size

Cons:
- Windows compatibility issues
- Docusaurus may not follow symlinks
- Git symlink handling

### Option 2: Direct References

Configure Docusaurus to read from `src/generated/` directly:

```javascript
// docusaurus.config.js
docs: {
  path: 'docs',
  include: ['**/*.{md,mdx}'],
  // Additional paths
  additionalPaths: [
    'src/generated/spec/v1/docs'
  ],
}
```

### Option 3: Keep Current (Document Why)

If copying is intentional:
- Document the reasoning
- Add validation that copies are current
- Add warning if out of sync

## Recommendation

**Investigate Option 2** (direct references) for best maintainability, fall back to **Option 3** (document current approach) if technical limitations exist.

---

## Agent Prompt

```
Investigate and improve the generated file handling strategy.

Tasks:
1. Research Docusaurus support for reading from multiple directories
2. Test if symbolic links work with Docusaurus build
3. Evaluate options:
   - Symbolic links
   - Direct references in Docusaurus config
   - Improved validation of copies
4. Implement best approach or document why copying is necessary
5. Add validation to ensure generated files are current

Expected outcome:
- Single source of truth for generated files
- Clear strategy documented
- No stale copies
```
