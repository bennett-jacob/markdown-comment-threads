# Markdown Comment Threads (MCT)

A standard for comment threads in Markdown files — footnote-based, git-diffable, and built for human–agent collaboration.

**INSTALLATION:**

```sh
npx skills add bennett-jacob/markdown-comment-threads
```

**[Read the spec →](SPEC.md)**

## Quick example

```markdown
This paragraph has a comment.[^a1b2c3]

[^a1b2c3]:
    🧵

    jbennett (2026-08-23T09:09:31Z)
    > Should we use hex IDs or UUIDs?

    claude[agent] (2026-08-23T09:15:00Z)
    > Hex is fine at document scale.

    ✅ resolved by jbennett (2026-08-23T12:00:00Z)
```

## Line types

| Type | Pattern |
| --- | --- |
| Comment header | `author (2026-08-23T09:09:31Z)` |
| Comment body | `> blockquoted text` (required) |
| Resolve | `✅ resolved by author (timestamp)` |
| Reopen | `🔓 reopened by author (timestamp)` |

Agents use the `[agent]` suffix in the author string (e.g. `claude[agent]`).

## Repository layout

| Path | Purpose |
| --- | --- |
| `SPEC.md` | Normative specification |
| `examples/` | Conforming documents |
| `test/valid/` | Fixtures that must pass validation |
| `test/invalid/` | Fixtures that must fail validation |
| `validate.mjs` | Conformance checker |
| `skills/markdown-comment-threads/` | Agent skill for reading and writing threads |

## Validate

```bash
node validate.mjs
```

## Agent skill

Install or copy `skills/markdown-comment-threads/SKILL.md` into your agent skills directory. See the skill for rules on adding comments, resolving, and reopening threads.

## License

MIT
