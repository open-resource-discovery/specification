# Issue #01: Package Reference Mismatch in Example File

**Priority:** CRITICAL
**Importance:** Critical
**Impact:** High
**Effort:** Low

## Problem Description

The example file `examples/documents/document-1.json` contains a critical validation error where resources reference packages with inconsistent ORD IDs.

### Specific Issues

1. **Package Definition** (line 19):
   ```json
   "ordId": "sap.foo.sub:package:ord-reference-app:v0"
   ```

2. **Resource References** (lines 59, 105, 136, 171, 197, 210, 229):
   ```json
   "partOfPackage": "sap.foo:package:ord-reference-app:v1"
   "partOfPackage": "sap.foo:package:SomePackage:v1"
   "partOfPackage": "sap.foo.bar:package:SomePackage:v1"
   ```

### Issues Identified

1. **Namespace mismatch:** `sap.foo.sub` vs `sap.foo` vs `sap.foo.bar`
2. **Version mismatch:** `v0` vs `v1`
3. **Name mismatch:** `ord-reference-app` vs `SomePackage`
4. **Non-existent packages:** References to packages not defined in the document

## Impact

- Example validation fails
- Users copying this example will create invalid ORD documents
- Automated validation (if implemented) would fail
- Undermines trust in the specification's examples
- Could confuse new users learning ORD

## Root Cause

The example file appears to be a composite of multiple examples merged together without proper reconciliation of package references. This suggests:
- Lack of automated validation for example files
- Manual editing errors
- No CI/CD validation step

## Proposed Solution

### Option 1: Consistent Single Package (Recommended)
Update all references to use the same package ID:

```json
{
  "packages": [
    {
      "ordId": "sap.foo:package:ord-reference-app:v1",
      ...
    }
  ],
  "apiResources": [
    {
      ...
      "partOfPackage": "sap.foo:package:ord-reference-app:v1"
    }
  ]
}
```

### Option 2: Multiple Packages
Define all referenced packages in the document:

```json
{
  "packages": [
    {
      "ordId": "sap.foo:package:ord-reference-app:v1",
      ...
    },
    {
      "ordId": "sap.foo:package:SomePackage:v1",
      ...
    },
    {
      "ordId": "sap.foo.bar:package:SomePackage:v1",
      ...
    }
  ]
}
```

**Recommendation:** Use Option 1 for simplicity and clarity in the example.

## Implementation Steps

1. Open `examples/documents/document-1.json`
2. Update the package definition to use `v1` instead of `v0`:
   ```json
   "ordId": "sap.foo:package:ord-reference-app:v1"
   ```
3. Update all `partOfPackage` references to match:
   ```json
   "partOfPackage": "sap.foo:package:ord-reference-app:v1"
   ```
4. Validate the JSON file against the schema
5. Test that the example works correctly

## Validation

After fixing, verify:
- [ ] All `partOfPackage` references point to defined packages
- [ ] Package IDs are consistent (namespace, name, version)
- [ ] JSON validates against Document.schema.json
- [ ] No validation errors in build process
- [ ] Example can be used as a template

## Related Issues

- Would be prevented by: #02 (Automated Testing)
- Related to: #16 (Pre-commit Hooks)

## Files to Modify

- `examples/documents/document-1.json`

## Testing

```bash
# Validate the example against the schema
npm run generate

# Check for validation errors in build output
npm run build
```

---

## Agent Prompt

```
Fix the package reference inconsistencies in the ORD example file located at examples/documents/document-1.json.

Context:
- The package is defined with ordId "sap.foo.sub:package:ord-reference-app:v0"
- Resources reference packages with different IDs: "sap.foo:package:ord-reference-app:v1", "sap.foo:package:SomePackage:v1", etc.
- This creates validation errors and is misleading for users

Task:
1. Read the file examples/documents/document-1.json
2. Identify all package definitions and all "partOfPackage" references
3. Standardize all references to use a single, consistent package ID: "sap.foo:package:ord-reference-app:v1"
4. Update the package definition from v0 to v1
5. Update all "partOfPackage" references throughout the file to match
6. Ensure the JSON remains valid
7. Validate that the changes are correct

Expected outcome:
- One package definition: "sap.foo:package:ord-reference-app:v1"
- All resources reference this package consistently
- No orphaned or invalid package references
- Valid JSON structure maintained
```
