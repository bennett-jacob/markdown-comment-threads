---
name: markdown-comment-threads
description: Use when reading, adding, resolving, or reopening footnote-based 🧵 comment threads in markdown files, or when agent/human discussion is stored inline in .md documents
---

# Markdown Comment Threads

## Overview

Comment threads use footnote syntax with a `🧵` marker. Three line types: comment headers, blockquoted bodies, and single-line actions. **Violating the line-type rules breaks parsers and confuses humans.**

Spec: [SPEC.md](../../SPEC.md) in the md-comment-threads repository.

## When to Use

- Adding or replying to inline comments in markdown
- Resolving or reopening a discussion thread
- Reading existing `🧵` threads before editing a document
- Agent-authored annotations on prose (use `[agent]` suffix)

Do **not** use for GitHub PR review comments, issue trackers, or sidecar JSON — those have their own formats.

## Quick Reference

| Task | What to write |
| --- | --- |
| Anchor a thread | `[^a1b2c3]` inline (3+ char meaningless hex id) |
| Start thread block | `[^id]:` then `🧵` on first body line |
| Add comment | `author (2026-08-23T09:09:31Z)` then `> body` |
| Resolve | `✅ resolved by author (2026-08-23T12:00:00Z)` — single line, no header above |
| Reopen | `🔓 reopened by author (2026-08-23T14:30:00Z)` — single line, no header above |
| Agent author | Include `[agent]` in name: `claude[agent]`, `Claude Code[agent]` |

**Timestamps:** ISO 8601 UTC with `Z` — `YYYY-MM-DDTHH:MM:SSZ`

## Line Types (strict)

```
[^def456]:
    🧵

    jbennett (2026-08-23T09:09:31Z)          ← comment header
    > Should we use hex IDs or UUIDs?        ← comment body (REQUIRED blockquote)

    claude[agent] (2026-08-23T09:15:00Z)     ← comment header
    > Hex is fine at document scale.         ← comment body

    ✅ resolved by jbennett (2026-08-23T12:00:00Z)   ← action (NO header line above)

    🔓 reopened by jbennett (2026-08-23T14:30:00Z)   ← action (NO header line above)

    claude[agent] (2026-08-23T14:31:00Z)
    > One more thing.
```

| Line type | Rule |
| --- | --- |
| Comment header | `author (timestamp)` — any author string, permissive |
| Comment body | Every content line starts with `>` |
| Action | Single line starting with `✅` or `🔓`; never blockquoted; never preceded by a header line |

## Adding a Comment

1. Generate a meaningless hex id (e.g. `f3a91b`).
2. Place `[^f3a91b]` inline at the anchor point.
3. At document end, add or extend the footnote block.
4. Append to an existing thread (do not edit prior lines):

```markdown
    claude[agent] (2026-08-23T09:15:00Z)
    > Your reply here.
```

## Resolving a Thread

Append one action line. **Do not** add an `author (timestamp)` header above it.

```markdown
    ✅ resolved by jbennett (2026-08-23T12:00:00Z)
```

## Reopening a Thread

Append one action line, then new comments if needed.

```markdown
    🔓 reopened by jbennett (2026-08-23T14:30:00Z)

    claude[agent] (2026-08-23T14:31:00Z)
    > Follow-up comment.
```

## Author Names

Permissive — all valid:

- `Jacob Bennett` — human display name
- `jbennett` — human handle
- `Claude Code[agent]` — agent display name
- `claude-code[agent]` — agent handle
- `claude[agent]` — agent short name

Agents **MUST** include `[agent]` in the author string.

Resolve author from git `user.name`, falling back to local username.

## Common Mistakes

| Mistake | Wrong | Right |
| --- | --- | --- |
| Header before action | `jbennett (ts)`<br>`✅ resolved by jbennett (ts)` | `✅ resolved by jbennett (ts)` only |
| Plain text body | `jbennett (ts)`<br>`This is the comment.` | `jbennett (ts)`<br>`> This is the comment.` |
| Blockquoted action | `> ✅ resolved by jbennett (ts)` | `✅ resolved by jbennett (ts)` |
| Missing `[agent]` | `claude (ts)` | `claude[agent] (ts)` |
| Local timestamp | `2026-08-23T09:09:31-05:00` | `2026-08-23T14:09:31Z` |
| Editing prior comments | Rewriting old lines | Append new lines only |

## Red Flags — STOP

- Writing `author (timestamp)` immediately before `✅ resolved` or `🔓 reopened`
- Comment text without `>` prefix
- Forgetting `[agent]` when you are an agent
- Editing or deleting existing thread lines instead of appending

**All of these mean: fix the format before saving.**

## Rationalizations

| Excuse | Reality |
| --- | --- |
| "The header line adds context for who resolved" | The action line already includes `by author` — a header line is invalid |
| "Blockquoting the resolve makes it visually consistent" | Actions are metadata, not comment content — blockquoting breaks parsers |
| "Plain text is easier to read in source" | Plain text is indistinguishable from metadata — blockquote is required |
| "I'll skip [agent] — it's obvious I'm an agent" | Humans scanning threads need the explicit marker |
| "I'll fix the old comment instead of appending" | Threads are append-only audit trails |

## Validate

If the md-comment-threads repo is available:

```bash
node validate.mjs
```
