# Issue #13: No Architecture Decision Records (ADRs)

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Medium
**Effort:** Low

## Problem

Major architectural decisions are not documented:
- Why Docusaurus?
- Why spec-toolkit?
- Why YAML for schemas?
- Why UMS plugin?
- Namespace design rationale
- ID format choices

New contributors don't understand:
- Design rationale
- Trade-offs considered
- Historical context
- Why things are the way they are

## Solution

Create Architecture Decision Records using ADR format:

```
docs/adr/
├── index.md (ADR index)
├── 0001-use-docusaurus-for-docs.md
├── 0002-yaml-schema-format.md
├── 0003-spec-toolkit-for-generation.md
├── 0004-namespace-design.md
├── 0005-ord-id-format.md
└── template.md
```

### ADR Template

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive
-

### Negative
-

### Neutral
-
```

## Key ADRs to Create

1. **ADR-001: Use Docusaurus for Documentation**
   - Why Docusaurus over alternatives?
   - React-based
   - Good search
   - Mermaid support

2. **ADR-002: YAML for Schema Definition**
   - Why YAML not JSON?
   - Readability
   - Comments
   - Tooling

3. **ADR-003: Spec Toolkit for Generation**
   - Why custom tool?
   - Multiple output formats needed
   - Plugin architecture

4. **ADR-004: Namespace Design**
   - Why colon-separated?
   - DNS-inspired
   - Hierarchy rules

5. **ADR-005: Semantic Versioning in IDs**
   - Why major version in ID?
   - Resource immutability
   - Backward compatibility

---

## Agent Prompt

```
Create Architecture Decision Records (ADRs) to document major design decisions.

Tasks:
1. Create docs/adr/ directory
2. Create ADR template (template.md)
3. Create index.md listing all ADRs
4. Write ADR-001: Use Docusaurus for Documentation
5. Write ADR-002: YAML for Schema Definition
6. Write ADR-003: Spec Toolkit for Generation
7. Write ADR-004: Namespace Design Principles
8. Write ADR-005: Semantic Versioning in ORD IDs
9. For each ADR:
   - Research the decision (git history, issues)
   - Document context
   - Explain decision
   - List consequences (positive/negative)
10. Update sidebars.js to include ADR section

Expected outcome:
- Design decisions documented
- Rationale clear for future contributors
- Historical context preserved
- Foundation for future ADRs
```
