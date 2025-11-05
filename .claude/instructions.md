# Claude Instructions for ORD Specification Project

You are assisting with the Open Resource Discovery (ORD) specification project. This is a protocol for applications to self-describe their exposed resources and capabilities.

## Critical Rules

### Generated Code - DO NOT EDIT
**NEVER edit files in these directories - they are automatically generated:**
- `src/generated/` - Auto-generated from YAML schemas
- `dist/` - Build output
- `build/` - Docusaurus site output
- `.docusaurus/` - Cache directory

If you need to change something in these directories, edit the source files instead and run `npm run generate`.

### Primary Source of Truth
The YAML schema files in `spec/v1/` are the source of truth for the specification:
- `spec/v1/Configuration.schema.yaml` - ORD Configuration format
- `spec/v1/Document.schema.yaml` - ORD Document format
- `spec/v1/Document.ums.yaml` - UMS metadata overrides

Any changes to the specification structure must be made in these YAML files.

## Development Workflow

When making changes:

1. **For spec changes**: Edit YAML files in `spec/v1/`, then run `npm run generate`
2. **For documentation**: Edit markdown files in `docs/`
3. **For examples**: Add/update files in `examples/`
4. **For build config**: Edit `docusaurus.config.js`, `package.json`, or `spec-toolkit.config.json`

Always run `npm run build` to verify changes before committing.

## Project Context

- **Purpose**: Define and document the ORD specification
- **Tech Stack**: Docusaurus, TypeScript, JSON Schema (YAML format)
- **Build Tool**: `@open-resource-discovery/spec-toolkit` generates types and docs from schemas
- **Documentation**: Available at https://open-resource-discovery.github.io/specification/

## Code Contribution Requirements

This project has specific requirements for AI-generated contributions (see `CONTRIBUTING_USING_GENAI.md`):
- Must comply with open-source licensing
- Must use AI tool features to filter similar third-party code
- Must properly attribute any third-party materials
- Must follow employer policies if applicable

## Common Operations

### Regenerate types and documentation
```bash
npm run generate
```

### Build everything
```bash
npm run build
```

### Start development server
```bash
npm start
```

### Clean build artifacts
```bash
npm run clean
```

## File Organization

- `spec/v1/*.yaml` - Schema definitions (edit these)
- `docs/**/*.md` - Documentation content (edit these)
- `examples/` - Example ORD data (edit these)
- `src/helper/` - Helper utilities (edit these)
- `src/theme/` - Docusaurus customizations (edit these)
- `src/generated/` - Generated code (DO NOT EDIT)

## When in Doubt

- Check `AGENTS.md` for detailed guidance
- Review `CONTRIBUTING.md` for contribution guidelines
- Look at existing examples in `examples/` and `docs/`
- Run the build process to catch errors early
