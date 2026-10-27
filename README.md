# Env Compare

Compare a `.env` file with its template and see which keys are missing, extra, or empty, without leaving VS Code.

> Screenshot placeholder: add a screenshot or GIF of the report here before publishing (see PUBLISHING.md).

## What it does

Env Compare reads your env file and your template file (`.env.example`, `.env.template`, or `.env.sample`) and reports:

- **Missing:** keys that are in the template but not in your env file.
- **Extra:** keys that are in your env file but not in the template.
- **Empty:** keys that exist in both files but have no value in your env file.
- **Duplicates:** keys defined more than once in a file (the last value wins).

Only key names appear in the report. Values are never printed.

## How to use

1. Open a folder that contains your env file and a template in its root.
2. Open the command palette (Ctrl+Shift+P, or Cmd+Shift+P on macOS).
3. Run **Env Compare: Compare .env with template**.
4. If more than one candidate file exists, pick the one you want from the list.
5. Read the report in the **Env Compare** output channel. A short summary also appears as a notification.

Example report:

```
Env Compare: .env vs .env.example

Missing from .env, present in .env.example (2)
  REDIS_URL
  SECRET_TOKEN

Extra in .env, not in .env.example (1)
  OLD_FLAG

Empty in .env (1)
  API_KEY

Duplicate keys (last value wins)
  .env: PORT
```

## Files it looks for

The extension only looks in the workspace root.

| Role | File names |
| --- | --- |
| Env file | `.env`, `.env.local` |
| Template | `.env.template`, `.env.example`, `.env.sample` |

## Supported syntax

- Comment lines starting with `#` and blank lines
- The `export ` prefix
- Single and double quoted values, with `\"`, `\\`, and `\n` escapes in double quotes
- Values that contain `=`
- Inline comments after unquoted values (` # note`)
- CRLF line endings and a leading byte order mark
- Duplicate keys

Not supported in this version: multi-line quoted values, variable expansion such as `${OTHER}`, quick fixes, settings, and multi-root workspaces (the first folder is used).

## Design decisions

- **Pure core.** The parser and the comparison are plain TypeScript with no VS Code dependency, so they are unit tested directly. Only `src/extension` imports `vscode`.
- **Keys only in the report.** Values are never shown, so the output is safe to screenshot or share.
- **Case sensitive keys.** `api_key` and `API_KEY` are different names, as they are on Linux and macOS.
- **Empty means a template key.** An empty value is reported only for keys that also exist in the template. An empty key that is not in the template is already reported as extra.
- **Last duplicate wins.** This matches how dotenv resolves duplicates, and the duplicate is reported so it is not hidden.
- **Output channel over a webview.** A plain text report is easy to read, copy, and keep small. A webview can come later if it is needed.
- **No network and no telemetry.** The extension only reads two local files.

## Development

```
npm install
npm test
npm run typecheck
npm run build
```

Open the project folder in VS Code and press F5 to start an Extension Development Host. In that window, open a folder that contains an env file and a template, then run the command.

Project layout:

```
src/parser/      env text to key value pairs
src/compare/     comparison and report text
src/extension/   VS Code integration
test/            unit tests
```

## License

MIT
