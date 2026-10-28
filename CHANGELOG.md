# Changelog

## 0.1.0

- Add the "Env Compare: Compare .env with template" command.
- Find `.env`, `.env.local`, `.env.template`, `.env.example`, and `.env.sample` in the workspace root, with a quick pick when there is more than one candidate.
- Add the same command to the right-click menu of env and template files, in the Explorer and in the editor. The clicked file is used as one side of the comparison.
- Report missing keys, extra keys, empty values, and duplicate keys in an Output Channel.
