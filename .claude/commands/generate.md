---
description: Regenerate TypeScript types and documentation from YAML schemas
---

Run `npm run generate` to regenerate TypeScript types and documentation from the YAML schema files in `spec/v1/`.

This command:
1. Parses `spec/v1/Configuration.schema.yaml` and `spec/v1/Document.schema.yaml`
2. Generates TypeScript interfaces and types
3. Creates documentation markdown files
4. Outputs everything to `src/generated/spec/v1/`

After running this command, review the output for any errors or warnings.
