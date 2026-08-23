# Markdown Comment Threads (MCT)

**Version:** 1.0.0  
**Status:** Draft

Comment threads in Markdown files using footnote syntax. Designed for back-and-forth between humans and agents, with optional resolution for living documents.

## Overview

Markdown has no native comment syntax. MCT overloads [footnote references](https://spec.commonmark.org/0.31.2/#footnote-references) with a `🧵` marker to distinguish comment threads from ordinary footnotes.

A conforming document:

1. Anchors a thread inline with `[^<id>]`.
2. Defines the thread at the document end (or any footnote block) with a body starting with `🧵`.
3. Stores comments, actions, and metadata in a strict line-type grammar.

## Conformance

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## Anchors

An inline thread anchor is a footnote reference:

```markdown
This paragraph has a comment.[^a1b2c3]
```

- `<id>` MUST be unique within the document.
- `<id>` SHOULD be meaningless. Three or more lowercase hexadecimal characters (e.g. `a1b2c3`) are recommended.
- `<id>` MUST NOT convey semantic meaning about the comment content.

## Thread definition

A comment thread is a footnote definition whose body begins with `🧵` on its own line:

```markdown
[^a1b2c3]:
    🧵

    jbennett (2026-08-23T09:09:31Z)
    > Should we use hex IDs or UUIDs?
```

Footnote continuation lines use the same indentation rules as the host Markdown flavor (typically four spaces).

### Thread marker

- The first non-empty line of a thread footnote body MUST be exactly `🧵` (U+1F9F5 THREAD emoji).
- Regular footnotes MUST NOT begin with `🧵`.

## Line types

Thread bodies contain three line types. Parsers MUST distinguish them.

### Comment header

Opens a comment:

```text
<author> (<timestamp>)
```

- `<author>` is any string that does not start with `>`, `✅`, or `🔓`.
- `<timestamp>` MUST be ISO 8601 UTC with a `Z` suffix and at least second precision: `YYYY-MM-DDTHH:MM:SSZ`. Fractional seconds MAY be present.
- A comment header MUST NOT appear immediately before an action line.

Valid author examples:

| Author | Notes |
| --- | --- |
| `Jacob Bennett` | Human display name |
| `jbennett` | Human handle |
| `Claude Code[agent]` | Agent display name |
| `claude-code[agent]` | Agent handle |
| `claude[agent]` | Agent short name |

Agents SHOULD include the literal suffix `[agent]` in the author string. This is the only standardized way to identify agent-authored comments.

### Comment body

All comment text MUST be blockquoted. Every body line MUST start with `>` followed by optional whitespace and the comment text.

```markdown
    jbennett (2026-08-23T09:09:31Z)
    > First paragraph.
    >
    > Second paragraph.
```

- A comment MUST have a header followed by one or more blockquoted lines.
- Non-blockquoted, non-empty lines that are not comment headers or actions are invalid.

### Action

Single-line status changes. Actions MUST NOT have a comment header on the preceding line.

**Resolve:**

```text
✅ resolved by <author> (<timestamp>)
```

**Reopen:**

```text
🔓 reopened by <author> (<timestamp>)
```

- `<author>` and `<timestamp>` follow the same rules as comment headers.
- Action lines MUST NOT be blockquoted.

## Thread lifecycle

Threads are append-only. Do not edit or delete prior comments or actions.

### State

| State | Condition |
| --- | --- |
| Open | No action line, or the last action is `🔓 reopened by` |
| Resolved | The last action is `✅ resolved by` |

New comments MAY be appended after a resolve action only when followed by a reopen action, or when reopening is not required by local convention. The recommended flow is: comment → resolve → reopen → comment.

### Resolution example

```markdown
[^def456]:
    🧵

    jbennett (2026-08-23T09:09:31Z)
    > Should we use hex IDs or UUIDs?

    claude[agent] (2026-08-23T09:15:00Z)
    > Hex is fine at document scale.

    ✅ resolved by jbennett (2026-08-23T12:00:00Z)

    🔓 reopened by jbennett (2026-08-23T14:30:00Z)

    claude[agent] (2026-08-23T14:31:00Z)
    > One more thing on collision handling.
```

## Coexistence with footnotes

Comment threads and ordinary footnotes share the footnote namespace.

```markdown
This uses a thread[^thr001] and a citation[^cite1].

[^thr001]:
    🧵

    jbennett (2026-08-23T10:00:00Z)
    > Question about this paragraph.

[^cite1]: Author, *Title* (2024). Page 12.
```

- Only footnote bodies starting with `🧵` are threads.
- Order of footnote definitions at the document end is unconstrained.

## Author identity

When tooling creates comments, it SHOULD resolve the author as:

1. Git `user.name`, if available in the environment.
2. Otherwise the local username (`whoami` / `$USER`).

Agents MUST append `[agent]` to the author string.

## Rendering guidance

Conforming renderers MAY:

- Hide thread footnotes from the bibliography-style footnote list.
- Show threads inline, in a margin, or in a sidebar.
- Style resolved threads differently from open threads.
- Surface open-thread counts.

Renderers that do not implement MCT SHOULD still render threads as ordinary footnotes. Human readers can identify threads by the `🧵` marker.

## Validation

See `validate.mjs` in this repository. Run:

```bash
node validate.mjs
```

The validator checks all files in `test/valid/` (must pass) and `test/invalid/` (must fail).

## Changelog

### 1.0.0

- Initial specification.
