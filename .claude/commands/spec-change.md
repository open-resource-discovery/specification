---
description: Guide for making changes to the ORD specification
---

To make changes to the ORD specification:

## Steps

1. **Edit YAML schemas** in `spec/v1/`:
   - `Configuration.schema.yaml` for ORD Configuration changes
   - `Document.schema.yaml` for ORD Document changes
   - `Document.ums.yaml` for UMS metadata overrides

2. **Run generation**: `npm run generate`
   - Regenerates TypeScript types in `src/generated/`
   - Updates generated documentation

3. **Update documentation** in `docs/`:
   - Add explanations for new fields or concepts
   - Update examples to reflect changes
   - Modify diagrams if structure changed

4. **Update examples** in `examples/`:
   - Ensure examples are valid against new schema
   - Add examples demonstrating new features

5. **Update CHANGELOG.md**:
   - Document breaking changes
   - Describe new features
   - Note deprecations

6. **Test**: Run `npm run build` to verify everything works

7. **Commit**: Create a clear commit message describing the change

## Notes

- Schema changes may be breaking - version appropriately
- Always regenerate after schema changes
- Keep documentation and examples in sync with schema
