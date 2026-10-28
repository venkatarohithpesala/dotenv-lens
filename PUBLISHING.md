# Packaging and publishing

Notes for packaging Env Compare with `vsce` and publishing it to the VS Code Marketplace. This file is excluded from the packaged extension.

## One-time setup

1. Sign in at https://dev.azure.com with a Microsoft account and create an organization if you have none.
2. Create a Personal Access Token there:
   - Organization: all accessible organizations
   - Scope: Marketplace, Manage
   - Copy the token and keep it private. Never commit it.
3. Create a publisher at https://marketplace.visualstudio.com/manage. The publisher ID is permanent and appears in the extension URL.
4. Set `publisher` in `package.json` to that ID (it is currently the placeholder `your-publisher-id`).
5. Log in once:

```
npx vsce login <publisher-id>
```

## Before every release

- Update `version` in `package.json` and add an entry to `CHANGELOG.md`.
- Run `npm test`, `npm run typecheck`, and `npm audit`.
- The README uses `images/demo.gif`. When packaging, vsce rewrites relative image links to your GitHub repository, so the file must be pushed to the public repo first. The GIF itself is left out of the package by `.vscodeignore`.
- Add a 128 by 128 PNG icon (for example `images/icon.png`), then add `"icon": "images/icon.png"` to `package.json`.
- Confirm no secrets or real env files are in the repository.

## Package

```
npm run vsce:package
```

This runs the production build (`vscode:prepublish`) and creates `env-compare-<version>.vsix`.

Check what goes into the package:

```
npx vsce ls
```

Only `dist/extension.js`, `package.json`, `README.md`, `CHANGELOG.md`, and `LICENSE` should be listed.

Test the package locally:

```
code --install-extension env-compare-0.1.0.vsix
```

Open a folder with an env file and a template, run **Env Compare: Compare .env with template**, then uninstall it from the Extensions view.

## Publish

```
npx vsce publish
```

To bump the version and publish in one step:

```
npx vsce publish patch
```

The extension usually appears on the Marketplace within a few minutes, after an automated verification.

## Updating

Bump the version, update the changelog, and run `npx vsce publish` again. A version number cannot be reused once published.

## Optional later

- Publish to Open VSX (for VSCodium and other editors) with `npx ovsx publish`.
- Add a GitHub Actions workflow that runs the tests on every push.
