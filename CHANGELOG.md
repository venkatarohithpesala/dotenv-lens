# Changelog

## 0.2.0 - Unreleased

- Add a hover for `process.env.NAME`, `process.env['NAME']`, and `process.env["NAME"]` in JavaScript and TypeScript files. It shows the value and the file it came from, reading `.env.local` first, then `.env`.
- Show the value as a highlighted `KEY=value` block under a DotEnv Lens header.
- Show a warning for empty values and an error for keys that are not set, in the colors of the user's theme.
- Add the `dotenvlens.maskSecrets` setting, off by default, to mask secret-looking values and connection URL passwords in the hover for screen sharing.
- Tell the user when a key is not set, and when the template lists it.

## 0.1.0 - 2026-10-28

- Add the "DotEnv Lens: Compare .env with template" command.
- Find `.env`, `.env.local`, `.env.template`, `.env.example`, and `.env.sample` in the workspace root, with a quick pick when there is more than one candidate.
- Add the same command to the right-click menu of env and template files, in the Explorer and in the editor. The clicked file is used as one side of the comparison.
- Report missing keys, extra keys, empty values, and duplicate keys in an Output Channel.
