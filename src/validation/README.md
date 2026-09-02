# Validation Tests

This directory contains automated validation tests for ORD specification examples.

## Example Validation Tests

The `exampleValidation.test.ts` file provides dynamic validation of all example files against their corresponding JSON schemas.

### Features

1. **Automatic Discovery**: The test suite automatically discovers and validates:
   - Configuration examples in `examples/configuration/`
   - Document examples in `examples/documents/`
   - Model extension examples (automatically detected when they exist)

2. **Dynamic Validation**: When you add a new example file to any of these directories, it will be automatically validated on the next test run. No code changes needed!

3. **Schema Reference Validation**: Verifies that example files reference the correct `$schema` URL.

4. **Detailed Error Messages**: When validation fails, the test output includes:
   - The specific field that failed validation
   - The validation error message
   - The error parameters for debugging

### Adding New Examples

To add a new example that will be automatically validated:

**For Configuration or Document examples:**
1. Add your `.json` file to `examples/configuration/` or `examples/documents/`
2. Ensure it includes a `$schema` reference (optional but recommended)
3. Run `npm test` - your example will be validated automatically

**For Model Extension examples:**
1. Create a directory matching your model extension name: `examples/models/{modelname}/`
2. Add your `.json` example files there
3. Run `npm test` - they will be discovered and validated automatically

### Running Tests

```bash
# Run all tests
npm test

# Run only after building TypeScript
npm run build-ts && node --test dist/**/*.test.js
```

### How It Works

1. **Schema Discovery**: Tests scan `src/generated/spec/v1/schemas/` for schema files
2. **Example Discovery**: For each schema, tests look for corresponding examples in the appropriate directory
3. **Validation**: Each example is validated against its schema using AJV (Another JSON Validator)
4. **Reporting**: Test results show which examples pass or fail, with detailed error messages

### Custom Keywords

The validator is configured to allow custom JSON Schema keywords (like `x-ums-type`, `x-ums-visibility`, etc.) that are used by ORD specification extensions.
