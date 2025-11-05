# Claude Configuration for ORD Specification

This directory contains Claude-specific configuration files to help AI assistants work effectively with this project.

## Files

- `instructions.md` - Core instructions and guidelines for Claude when working on this project
- `commands/` - Custom slash commands for common operations (if any)

## Usage

When Claude Code or Claude.ai opens this project, it will automatically read the configuration from this directory to understand:

- Project structure and purpose
- Which files are generated (and should not be edited)
- Development workflow and build process
- Contribution guidelines for AI-generated code

## For Human Contributors

This configuration is specifically for AI coding assistants. Human contributors should refer to:

- `../AGENTS.md` - Tool-agnostic AI agent guidelines
- `../CONTRIBUTING.md` - General contribution guidelines
- `../CONTRIBUTING_USING_GENAI.md` - AI code contribution requirements
- `../README.md` - Project overview

## Customization

Project maintainers can customize Claude's behavior by:

1. Editing `instructions.md` to add project-specific context
2. Adding slash commands in `commands/` directory
3. Creating additional markdown files for specific workflows

See [Claude Code documentation](https://docs.claude.com/en/docs/claude-code) for more information.
