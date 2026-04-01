# Example Files

This folder contains example ORD Documents and ORD Configs.

These examples demonstrate ORD features but require customization before use. Specifically, you must:
- Replace namespace identifiers with your registered namespaces
- Update system-specific URLs and endpoints
- Adjust version numbers to match your implementation

## File naming convention

All files in this folder will be used for example documentation and will also be validated.

All ORD Documents MUST start with `document-` and all ORD Configs with `configuration-`.
The file extension must be `.json` or `.jsonc`, so they are considered for documentation and validation.

## Overlay examples

Overlay examples are available under `examples/overlay/`.
Some of them are used in `src/overlay-merge` tests together with existing metadata examples.
