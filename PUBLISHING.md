# Publishing EnvLens

Notes for releasing to the VS Code Marketplace. This file is not included in the extension package.

## Before every release

1. Set the new `version` in `package.json` and add an entry to `CHANGELOG.md`.
2. Run the checks:

```
npm test
npm run typecheck
npm run build
```

3. Push everything to GitHub first. The README images load from the repository.

## Build the package

```
npm run vsce:package
```

This creates `envlens-<version>.vsix`. To see what goes inside:

```
npx vsce ls
```

You should only see `dist/extension.js`, `package.json`, `README.md`, `CHANGELOG.md`, `LICENSE`, and `images/icon.png`.

## Test the package

In VS Code, open the Extensions panel, click the `...` menu, choose **Install from VSIX**, and pick the file. Open a folder with an env file and a template, run **EnvLens: Compare .env with template**, then uninstall it.

## First release: upload in the browser

1. Open https://marketplace.visualstudio.com/manage and select the publisher `venkatarohithpesala`.
2. Click **New extension**, then **Visual Studio Code**.
3. Upload the `.vsix` file.

## Later releases: command line

1. Create a Personal Access Token at https://dev.azure.com with the scope **Marketplace, Manage** and access to all organizations. Never commit it or share it.
2. Log in once and publish:

```
npx vsce login venkatarohithpesala
npx vsce publish
```

To raise the version and publish in one step, use `npx vsce publish patch`.

## Notes

- The extension ID `venkatarohithpesala.envlens` is permanent.
- A published version number cannot be reused.
- The publisher can verify a domain from its Marketplace page. This is optional.
