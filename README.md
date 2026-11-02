# DotEnv Lens

See your `.env` values without leaving your code, and catch missing keys before they break your app.

- **Hover** over `process.env.NAME` to see its value.
- **Compare** your `.env` with its template to find missing, extra, and empty keys.

![DotEnv Lens hover demo](images/hover-demo.gif)

## Hover over process.env

In JavaScript and TypeScript files (including JSX and TSX), hover over `process.env.NAME`, `process.env['NAME']`, or `process.env["NAME"]` to see its value and the file it came from.

- Values are read from `.env.local` first, then `.env`.
- An empty value shows a warning, and a key that is not set shows an error, in your theme's colors.
- When a key is missing, the hover also tells you if your template lists it.

The full value is shown. If you share your screen or record a demo, turn on masking. It hides keys containing `KEY`, `SECRET`, `TOKEN`, `PASSWORD`, and similar words, plus passwords inside connection URLs such as `postgres://user:********@host/db`.

| Setting | Default | What it does |
| --- | --- | --- |
| `dotenvlens.maskSecrets` | `false` | Set to `true` to mask secret-looking values in the hover. |

## Compare .env with its template

![DotEnv Lens compare demo](images/demo.gif)

Open a folder that has a `.env` file and a template, then do one of these:

- Press Ctrl+Shift+P (Cmd+Shift+P on macOS) and run **DotEnv Lens: Compare .env with template**.
- Right-click an env or template file and choose **DotEnv Lens: Compare .env with template**.

The report opens in the **DotEnv Lens** output panel. It shows:

- **Missing:** in the template, not in your `.env`
- **Extra:** in your `.env`, not in the template
- **Empty:** in your `.env`, but with no value
- **Duplicates:** defined more than once (the last one wins)

The report shows key names only. Values are never printed in it.

```
DotEnv Lens: .env vs .env.example

Missing from .env, present in .env.example (2)
  REDIS_URL
  SECRET_TOKEN

Extra in .env, not in .env.example (1)
  OLD_FLAG

Empty in .env (1)
  API_KEY
```

## Files it finds

| Type | Names |
| --- | --- |
| Env file | `.env`, `.env.local` |
| Template | `.env.template`, `.env.example`, `.env.sample` |

If there is more than one match, you pick from a list.

## Limits

Multi-line quoted values and `${VAR}` expansion are not supported. The hover covers `process.env` only (not `import.meta.env` or other languages). In a multi-root workspace, only the first folder is used.

## Design decisions

- The parser and comparison are plain TypeScript with no VS Code dependency, so they are unit tested on their own.
- Keys are case sensitive, like env variables on Linux and macOS.
- Empty is reported only for keys that also exist in the template.
- The hover shows full values, because that is its purpose. Masking is one setting away for screen sharing and recording.
- The extension only reads local env files and makes no network calls.

## Development

```
npm install
npm test
npm run build
```

Press F5 in VS Code to run the extension in a test window.

## License

MIT
