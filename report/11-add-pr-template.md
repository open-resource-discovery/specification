# Issue #11: Missing Pull Request Template

**Priority:** MEDIUM
**Importance:** Medium
**Impact:** Medium
**Effort:** Low

## Problem

No PR template exists. Contributors don't know:
- What information to provide
- Checklist of tasks to complete
- Testing requirements
- Documentation expectations

Results in:
- Incomplete PRs
- Back-and-forth in reviews
- Forgotten documentation updates
- Missing test coverage

## Solution

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description

<!-- Describe your changes in detail -->

## Related Issue

Fixes #(issue)

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Example update

## Changes Made

<!-- List the changes made in this PR -->

-
-

## Testing

- [ ] Examples validate successfully
- [ ] Build succeeds locally
- [ ] Documentation reviewed
- [ ] Links checked

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have checked my code and corrected any misspellings
- [ ] Schema changes are backward compatible (or marked as breaking)

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Additional Notes

<!-- Any additional information that reviewers should know -->
```

---

## Agent Prompt

```
Create a pull request template for the ORD specification repository.

Tasks:
1. Create .github/PULL_REQUEST_TEMPLATE.md
2. Include sections for:
   - Description
   - Related issue
   - Type of change
   - Testing checklist
   - Reviewer checklist
3. Tailor to specification project needs
4. Keep it concise but comprehensive

Expected outcome:
- PRs have consistent format
- Contributors know what's expected
- Fewer review iterations
- Better PR quality
```
