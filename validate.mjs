#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const FOOTNOTE_DEF = /^\[\^([^\]]+)\]:\s*(.*)$/;
const INLINE_REF = /\[\^([^\]]+)\]/g;
const RESOLVED = /^✅ resolved by (.+) \(([^)]+)\)$/;
const REOPENED = /^🔓 reopened by (.+) \(([^)]+)\)$/;
const COMMENT_HEADER = /^(.+) \(([^)]+)\)$/;

/** @param {string} file */
async function validateFile(file) {
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  const errors = [];
  const defined = new Set();
  const referenced = new Set();

  for (const line of lines) {
    for (const match of line.matchAll(INLINE_REF)) referenced.add(match[1]);
  }

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(FOOTNOTE_DEF);
    if (!match) continue;

    const [, id, firstLine] = match;
    if (defined.has(id)) errors.push(`duplicate footnote id [^${id}]`);
    defined.add(id);

    const body = [];
    let inFootnote = false;
    if (firstLine.trim()) {
      body.push(firstLine.trim());
      inFootnote = true;
    }
    index++;
    while (index < lines.length) {
      const line = lines[index];
      if (/^ {4}/.test(line)) {
        body.push(line.slice(4));
        inFootnote = true;
        index++;
      } else if (!line.trim() && inFootnote) {
        body.push("");
        index++;
      } else {
        break;
      }
    }
    index--;

    if (body[0] === "🧵") errors.push(...validateThread(id, body.slice(1)));
  }

  for (const id of referenced) {
    if (!defined.has(id)) errors.push(`undefined reference [^${id}]`);
  }

  return errors;
}

/** @param {string} id @param {string[]} lines */
function validateThread(id, lines) {
  const errors = [];
  let state = "start";
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const trimmed = line.trimEnd();
    if (!trimmed) continue;

    const actions = [[RESOLVED, "resolved"], [REOPENED, "reopened"]];
    let matchedAction = false;
    for (const [pattern, kind] of actions) {
      if (!pattern.test(trimmed)) continue;
      matchedAction = true;
      if (state === "header") errors.push(`[^${id}] line ${lineNumber}: action cannot follow comment header without body`);
      state = "action";
      const match = trimmed.match(pattern);
      if (!match || !TIMESTAMP.test(match[2])) errors.push(`invalid ${kind} action: "${trimmed}"`);
      break;
    }
    if (matchedAction) continue;

    if (trimmed.startsWith(">")) {
      const quoted = trimmed.replace(/^>\s?/, "");
      if (RESOLVED.test(quoted) || REOPENED.test(quoted)) {
        errors.push(`[^${id}] line ${lineNumber}: action must not be blockquoted`);
        continue;
      }
      if (state === "header" || state === "body") {
        state = "body";
        continue;
      }
      errors.push(`[^${id}] line ${lineNumber}: blockquote outside comment`);
      continue;
    }

    const header = trimmed.match(COMMENT_HEADER);
    if (header) {
      if (state === "header") errors.push(`[^${id}] line ${lineNumber}: comment header without blockquoted body`);
      state = "header";
      if (!TIMESTAMP.test(header[2])) errors.push(`[^${id}] line ${lineNumber}: invalid timestamp "${header[2]}"`);
      continue;
    }

    errors.push(`[^${id}] line ${lineNumber}: invalid line "${trimmed}"`);
  }

  if (state === "header") errors.push(`[^${id}]: comment header without blockquoted body`);
  return errors;
}

/** @param {string} dir @param {boolean} shouldPass */
async function runSuite(dir, shouldPass) {
  let failures = 0;
  const files = (await readdir(dir)).filter((name) => name.endsWith(".md")).sort();

  for (const name of files) {
    const file = join(dir, name);
    const errors = await validateFile(file);
    const passed = shouldPass ? errors.length === 0 : errors.length > 0;

    if (!passed) {
      failures++;
      console.error(`FAIL ${file}`);
      if (shouldPass) errors.forEach((error) => console.error(`  ${error}`));
      else console.error(`  expected errors, got none`);
    } else {
      console.log(`ok ${file}`);
    }
  }

  return failures;
}

const root = new URL(".", import.meta.url).pathname;
const validFailures = await runSuite(join(root, "test/valid"), true);
const invalidFailures = await runSuite(join(root, "test/invalid"), false);

if (validFailures || invalidFailures) process.exit(1);
console.log("all conformance checks passed");
