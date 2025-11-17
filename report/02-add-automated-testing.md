# Issue #02: No Automated Testing or Validation

**Priority:** HIGH
**Importance:** High
**Impact:** High
**Effort:** Medium

## Problem Description

The ORD specification repository has **zero test files**. There are no:
- Unit tests
- Integration tests
- Schema validation tests
- Example validation tests
- Build script tests

This is critical for a project that:
- Generates schemas from YAML
- Publishes an NPM package
- Provides 9 example files
- Has complex build logic

## Impact

**Current Risks:**
- Breaking changes not detected before release
- Invalid examples in documentation (as seen in #01)
- Regression bugs in schema generation
- Untested build scripts
- No confidence in refactoring
- Difficult to validate contributions

**Business Impact:**
- Users lose trust if examples don't work
- Bugs in generated schemas affect all consumers
- Higher maintenance cost due to manual testing
- Slower development velocity

## Current State

```bash
$ find . -name "*.test.*" -o -name "*.spec.*"
# No results
```

No test infrastructure exists:
- No test framework installed (Jest, Mocha, etc.)
- No test scripts in package.json
- No test coverage reporting
- No CI test execution

## Proposed Solution

Implement a comprehensive testing strategy:

### 1. Schema Validation Tests
Validate that generated schemas are correct:
- JSON Schema syntax validation
- Schema completeness checks
- Required fields validation

### 2. Example Validation Tests
Validate all example files against schemas:
- `examples/documents/*.json` validate against Document.schema.json
- `examples/configuration/*.json` validate against Configuration.schema.json
- Ensure no validation errors

### 3. Build Script Tests
Test the build and generation logic:
- `copyGeneratedToDestination.ts` unit tests
- Generation pipeline integration tests
- Error handling tests

### 4. Type Generation Tests
Verify TypeScript types are correctly generated:
- Types are exported correctly
- No TypeScript compilation errors
- Types match schemas

### 5. Documentation Link Tests
Validate internal links in documentation:
- No broken internal links
- All referenced files exist
- Anchors exist in target files

## Recommended Tools

### Test Framework
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### Schema Validation
```json
{
  "devDependencies": {
    "ajv": "^8.12.0",
    "ajv-formats": "^2.1.1"
  }
}
```

### Link Checking
```json
{
  "devDependencies": {
    "markdown-link-check": "^3.11.0"
  }
}
```

## Implementation Steps

### Phase 1: Setup Test Infrastructure (Week 1)

1. **Install test dependencies:**
```bash
npm install --save-dev jest @types/jest ts-jest ajv ajv-formats
npx ts-jest config:init
```

2. **Create test directory structure:**
```
tests/
├── unit/
│   ├── build-scripts.test.ts
│   └── helpers.test.ts
├── integration/
│   ├── schema-generation.test.ts
│   └── example-validation.test.ts
└── fixtures/
    ├── valid-document.json
    └── invalid-document.json
```

3. **Add test scripts to package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:examples": "jest tests/integration/example-validation.test.ts",
    "validate:examples": "node scripts/validate-examples.js"
  }
}
```

### Phase 2: Example Validation Tests (Week 1)

Create `tests/integration/example-validation.test.ts`:
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as path from 'path';

describe('Example Files Validation', () => {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const documentSchema = JSON.parse(
    fs.readFileSync('./static/spec-v1/interfaces/Document.schema.json', 'utf-8')
  );

  const validateDocument = ajv.compile(documentSchema);

  const exampleFiles = fs.readdirSync('./examples/documents')
    .filter(f => f.endsWith('.json'));

  test.each(exampleFiles)('validates %s against Document schema', (filename) => {
    const example = JSON.parse(
      fs.readFileSync(path.join('./examples/documents', filename), 'utf-8')
    );

    const valid = validateDocument(example);

    if (!valid) {
      console.error('Validation errors:', validateDocument.errors);
    }

    expect(valid).toBe(true);
  });
});
```

### Phase 3: Build Script Tests (Week 2)

Create `tests/unit/build-scripts.test.ts`:
```typescript
import { copyGeneratedToDestination } from '../../src/helper/copyGeneratedToDestination';
import * as fs from 'fs-extra';

jest.mock('fs-extra');

describe('copyGeneratedToDestination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should copy all required files', async () => {
    await copyGeneratedToDestination();

    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('Configuration.md'),
      expect.any(String)
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining('Document.md'),
      expect.any(String)
    );
  });

  it('should create necessary directories', async () => {
    await copyGeneratedToDestination();

    expect(fs.ensureDir).toHaveBeenCalledWith('docs/spec-v1/interfaces/');
    expect(fs.ensureDir).toHaveBeenCalledWith('static/spec-v1/interfaces/');
  });
});
```

### Phase 4: CI Integration (Week 2)

Update `.github/workflows/main.yml`:
```yaml
- name: Run tests
  run: npm test

- name: Validate examples
  run: npm run validate:examples

- name: Check test coverage
  run: npm run test:coverage
```

### Phase 5: Documentation (Week 2)

Add testing section to CONTRIBUTING.md:
```markdown
## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Validate example files
npm run validate:examples

# Generate coverage report
npm run test:coverage
```

## Expected Outcomes

After implementation:
- ✅ All examples validate against schemas
- ✅ Build scripts have test coverage
- ✅ CI runs tests on every PR
- ✅ Test coverage > 80% for critical code
- ✅ Contributors can run tests locally
- ✅ Breaking changes caught before merge

## Success Metrics

- Test suite runs in < 30 seconds
- 100% of examples validate successfully
- > 80% code coverage for src/
- Zero test failures in CI
- Tests added for all new features

## Dependencies

This issue helps prevent:
- #01 (Package reference bugs)
- Future validation errors
- Schema generation bugs
- Breaking changes to NPM package

## Files to Create

- `tests/integration/example-validation.test.ts`
- `tests/unit/build-scripts.test.ts`
- `tests/integration/schema-generation.test.ts`
- `jest.config.js`
- `scripts/validate-examples.js`

## Files to Modify

- `package.json` (add test scripts and dependencies)
- `.github/workflows/main.yml` (add test step)
- `CONTRIBUTING.md` (add testing documentation)

---

## Agent Prompt

```
Add comprehensive automated testing infrastructure to the ORD specification repository.

Context:
- The repository currently has ZERO test files
- There are 9 example JSON files that should be validated against schemas
- Build scripts and generation logic are untested
- This is a specification that publishes an NPM package used by others

Tasks:
1. Install testing dependencies (Jest, ajv for schema validation)
2. Create test directory structure (tests/unit/, tests/integration/)
3. Implement example validation tests that:
   - Load all .json files from examples/documents/
   - Validate each against Document.schema.json using AJV
   - Report validation errors clearly
4. Add test scripts to package.json:
   - "test": "jest"
   - "test:watch": "jest --watch"
   - "test:coverage": "jest --coverage"
   - "validate:examples": validation script for examples
5. Create jest.config.js for TypeScript support
6. Update .github/workflows/main.yml to run tests in CI
7. Add testing documentation to CONTRIBUTING.md
8. Ensure all current examples pass validation (fix any issues found)

Priority: Start with example validation tests as these provide immediate value.

Expected outcomes:
- Working test suite that catches validation errors
- CI pipeline runs tests on every PR
- Documentation for running tests locally
- Foundation for adding more tests in the future
```
