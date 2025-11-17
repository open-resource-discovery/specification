# Issue #17: Prototype .jsonc Files Not Well Organized

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Low
**Effort:** Low

## Problem

`.jsonc` files in `examples/documents/`:
- `document-integration-dependencies.jsonc`
- `document-poc.jsonc`

These are prototypes/PoCs, not production examples:
- Ignored by validation
- Mixed with production examples
- Confusing for users
- Unclear purpose

## Solution

### Option 1: Separate Directory (Recommended)
```
examples/
├── documents/ (production examples only)
├── configuration/
├── implementation/
└── prototypes/
    ├── README.md (explain these are WIP/PoC)
    ├── document-integration-dependencies.jsonc
    └── document-poc.jsonc
```

### Option 2: Delete if Obsolete
If these files are no longer needed:
- Archive or delete them
- Keep examples clean

### Option 3: Convert to .json
If they're stable enough:
- Convert to .json
- Make them production examples
- Include in validation

---

## Agent Prompt

```
Organize prototype .jsonc files in the examples directory.

Tasks:
1. Review document-integration-dependencies.jsonc and document-poc.jsonc
2. Determine if they are:
   - Still needed
   - Ready for production
   - Should be prototypes
3. If prototypes:
   - Create examples/prototypes/ directory
   - Move .jsonc files there
   - Add README explaining these are WIP/PoC
   - Update examples/README.md
4. If obsolete:
   - Delete the files
   - Document in commit message
5. If production-ready:
   - Convert to .json
   - Validate against schemas
   - Update content if needed

Expected outcome:
- Clear separation of production vs prototype examples
- No confusion for users
- Better organization
```
