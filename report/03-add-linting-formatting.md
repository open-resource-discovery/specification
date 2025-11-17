# Issue #03: Missing ESLint and Prettier Configuration

**Priority:** HIGH
**Importance:** High
**Impact:** High
**Effort:** Low

## Problem Description

The repository lacks code quality tooling:
- No ESLint configuration
- No Prettier configuration
- Only basic `.editorconfig` exists
- No automated code style enforcement
- Inconsistent code formatting

## Impact

**Developer Experience:**
- Inconsistent code style across files
- Subjective code review discussions about formatting
- Time wasted on manual formatting
- Harder to onboard new contributors

**Code Quality:**
- Potential bugs not caught (unused variables, etc.)
- TypeScript best practices not enforced
- Import organization inconsistent
- No accessibility linting for React components

**Maintainability:**
- Technical debt accumulates
- Harder to refactor with confidence
- Code becomes less readable over time

## Current State

```bash
$ find . -name ".eslintrc*" -o -name ".prettierrc*"
# No results

$ cat .editorconfig
# Only basic settings: charset, newlines, indentation
```

## Proposed Solution

Implement comprehensive linting and formatting:

### 1. ESLint for JavaScript/TypeScript
- Catch potential bugs
- Enforce coding standards
- TypeScript-specific rules
- React/JSX best practices

### 2. Prettier for Code Formatting
- Consistent code style
- Automatic formatting
- No debates about style
- Format on save

### 3. Integration
- Pre-commit hooks (with lint-staged)
- CI validation
- Editor integration
- Auto-fix on commit

## Recommended Configuration

### Dependencies

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.0",
    "eslint-plugin-jsx-a11y": "^6.8.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.2.0",
    "lint-staged": "^15.2.0"
  }
}
```

### ESLint Configuration

Create `.eslintrc.js`:
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // Must be last to override other configs
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // Import ordering
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // React
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'off', // Using TypeScript

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.docusaurus/',
    'src/generated/',
  ],
};
```

### Prettier Configuration

Create `.prettierrc.json`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "proseWrap": "preserve"
}
```

Create `.prettierignore`:
```
node_modules/
dist/
build/
.docusaurus/
src/generated/
package-lock.json
*.md
```

### Lint-staged Configuration

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

## Implementation Steps

### Phase 1: Setup (1-2 hours)

1. **Install dependencies:**
```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint \
  eslint-config-prettier \
  eslint-plugin-import \
  eslint-plugin-jsx-a11y \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  prettier \
  lint-staged
```

2. **Create configuration files:**
```bash
touch .eslintrc.js
touch .prettierrc.json
touch .prettierignore
```

3. **Add npm scripts to package.json:**
```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,css,scss,md}\""
  }
}
```

### Phase 2: Initial Formatting (1 hour)

1. **Format all existing code:**
```bash
npm run format
```

2. **Fix auto-fixable linting issues:**
```bash
npm run lint:fix
```

3. **Manually fix remaining issues:**
```bash
npm run lint
# Fix any remaining errors
```

### Phase 3: CI Integration (30 minutes)

Update `.github/workflows/main.yml`:
```yaml
- name: Check code formatting
  run: npm run format:check

- name: Run ESLint
  run: npm run lint
```

### Phase 4: Documentation (30 minutes)

Add to CONTRIBUTING.md:
```markdown
## Code Quality

This project uses ESLint and Prettier to maintain code quality and consistency.

### Running Locally

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check code formatting
npm run format:check

# Format all files
npm run format
```

### Editor Setup

**VS Code:**
Install the ESLint and Prettier extensions and add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
```

## Expected Outcomes

After implementation:
- ✅ Consistent code style across the project
- ✅ Automatic formatting on save (in supported editors)
- ✅ CI catches formatting and linting issues
- ✅ Fewer subjective code review comments
- ✅ Better code quality through linting rules
- ✅ Easier onboarding for new contributors

## Success Metrics

- All existing code passes linting
- All existing code is formatted consistently
- CI validates formatting and linting
- No new linting errors introduced
- Reduced code review time for style issues

## Files to Create

- `.eslintrc.js`
- `.prettierrc.json`
- `.prettierignore`
- `.vscode/settings.json` (optional but recommended)

## Files to Modify

- `package.json` (add scripts and dependencies)
- `.github/workflows/main.yml` (add linting/formatting checks)
- `CONTRIBUTING.md` (add code quality section)
- All existing `.ts`, `.tsx`, `.js` files (format and fix)

## Related Issues

- Complements: #16 (Pre-commit Hooks)
- Helps with: #02 (Testing - consistent code style in tests)

---

## Agent Prompt

```
Add ESLint and Prettier configuration to the ORD specification repository for code quality and consistent formatting.

Context:
- Repository currently has no linting or formatting tools
- Only basic .editorconfig exists
- Project uses TypeScript, React (Docusaurus), and Node.js
- Need to enforce code quality and consistent style

Tasks:
1. Install ESLint, Prettier, and related plugins as dev dependencies:
   - @typescript-eslint/eslint-plugin
   - @typescript-eslint/parser
   - eslint
   - eslint-config-prettier
   - eslint-plugin-import
   - eslint-plugin-jsx-a11y
   - eslint-plugin-react
   - eslint-plugin-react-hooks
   - prettier
   - lint-staged

2. Create .eslintrc.js with:
   - TypeScript support
   - React/JSX rules
   - Import ordering rules
   - Accessibility checks
   - Integration with Prettier
   - Ignore generated files (src/generated/, .docusaurus/, build/, dist/)

3. Create .prettierrc.json with sensible defaults:
   - 2 space indentation
   - Semicolons enabled
   - Single quotes disabled
   - 100 character line width

4. Create .prettierignore to exclude:
   - node_modules/
   - dist/
   - build/
   - .docusaurus/
   - src/generated/
   - *.md files

5. Add npm scripts to package.json:
   - "lint": run ESLint
   - "lint:fix": auto-fix ESLint issues
   - "format": format all files with Prettier
   - "format:check": check formatting without modifying

6. Update .github/workflows/main.yml to:
   - Run "npm run format:check" before build
   - Run "npm run lint" before build

7. Format all existing TypeScript files with Prettier

8. Fix any auto-fixable ESLint errors

9. Document the setup in CONTRIBUTING.md

Expected outcomes:
- Consistent code formatting across the project
- Automated linting catches common issues
- CI validates code quality
- Better developer experience
```
