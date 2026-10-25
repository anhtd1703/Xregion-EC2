# Antigravity Setup

## 1. Create/open project folder

Create an empty project folder such as:

```text
xregion-ec2/
```

Copy into it:

```text
AGENTS.md
plan/
.agents/
ANTIGRAVITY_SETUP.md
```

Open the entire `xregion-ec2` folder in Antigravity.

Do not open only the `plan` folder.

## 2. Initial prompt

Give Gemini:

```text
Read AGENTS.md, all relevant files under /plan, and workspace rules under /.agents/rules.

Then follow plan/19_MASTER_PROMPT_FOR_GEMINI.md.

Execute Phase 0 only.

Use workspace skills when relevant.
Do not start Phase 1.
Do not connect to or mutate real AWS/OpenStack resources.

Before coding, inspect the repository and state what you will create.
After coding, run formatting, lint, typecheck and tests and report results.
```

## 3. Skills

Available workspace skills:

```text
implement-frontend-page
implement-api
review-code
verify-project
deploy-xregion
```

Use them for reusable workflows instead of repeating long prompts.

## 4. Recommended phase loop

```text
Phase N
  ↓
implementation
  ↓
review-code
  ↓
verify-project
  ↓
human review
  ↓
git commit
  ↓
Phase N+1
```

Never let the agent automatically continue through all phases.

## 5. Real cloud work

When Phase 7 or deployment begins, require explicit approval before any real resource mutation.
