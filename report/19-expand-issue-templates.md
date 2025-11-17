# Issue #19: Limited Issue Templates

**Priority:** LOW
**Importance:** Low
**Impact:** Low
**Effort:** Low

## Problem

Only 2 issue templates exist:
- Bug report
- Feature request

Missing templates for:
- Specification clarification requests
- Example contributions
- Documentation improvements
- Questions

## Solution

Add more issue templates:

```
.github/ISSUE_TEMPLATE/
├── bug_report.md (exists)
├── feature_request.md (exists)
├── clarification.md (new)
├── example_contribution.md (new)
├── documentation.md (new)
└── question.md (new)
```

---

## Agent Prompt

```
Expand GitHub issue templates for better issue categorization.

Tasks:
1. Create clarification.md for specification questions
2. Create example_contribution.md for contributing examples
3. Create documentation.md for doc improvements
4. Create question.md for general questions
5. Update config.yml if needed
6. Test templates work in GitHub

Expected outcome:
- Better issue categorization
- Easier for users to report issues
- Clear information collected
```
