# Issue #20: Missing Cookbook/Recipes Section

**Priority:** LOW
**Importance:** Low
**Impact:** Medium
**Effort:** Medium

## Problem

Documentation has examples but no step-by-step "how-to" guides for common tasks:
- How to describe a REST API
- How to add custom attributes
- How to implement custom policy levels
- How to describe event resources
- How to use integration dependencies

Users need practical, task-oriented guides.

## Solution

Create cookbook section with recipes:

```
docs/cookbook/
├── index.md (cookbook overview)
├── describe-rest-api.md
├── add-custom-attributes.md
├── implement-policy-level.md
├── describe-event-resource.md
└── use-integration-dependencies.md
```

Each recipe:
- Clear goal
- Prerequisites
- Step-by-step instructions
- Complete example
- Common pitfalls
- Related resources

---

## Agent Prompt

```
Create a cookbook section with practical how-to guides for common ORD tasks.

Tasks:
1. Create docs/cookbook/ directory
2. Create index.md with cookbook overview
3. Create recipes for:
   - Describing a REST API (step-by-step)
   - Adding custom extensibility attributes
   - Implementing a custom policy level
   - Describing event resources
   - Using integration dependencies
4. Each recipe should include:
   - Clear objective
   - Prerequisites
   - Step-by-step instructions
   - Complete working example
   - Troubleshooting tips
5. Update sidebars.js
6. Cross-link from specification

Expected outcome:
- Practical task-oriented guides
- Easy for users to accomplish common tasks
- Complete working examples
```
