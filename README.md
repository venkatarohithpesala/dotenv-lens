# DotEnv Lens

See what is wrong with your `.env` file in one click. DotEnv Lens compares it with your template and shows missing, extra, and empty keys.

![DotEnv Lens demo](images/demo.gif)

## What it reports

- **Missing:** in the template, not in your `.env`
- **Extra:** in your `.env`, not in the template
- **Empty:** in your `.env`, but with no value
- **Duplicates:** defined more than once (the last one wins)

Only key names are shown. Values are never printed.

## How to use

Open a folder that has a `.env` file and a template, then do one of these:

- Press Ctrl+Shift+P (Cmd+Shift+P on macOS) and run **DotEnv Lens: Compare .env with template**.
- Right-click an env or template file and choose **DotEnv Lens: Compare .env with template**.

The report opens in the **DotEnv Lens** output panel.

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

Multi-line quoted values and `${VAR}` expansion are not supported. In a multi-root workspace, only the first folder is used.

## Design decisions

- The parser and comparison are plain TypeScript with no VS Code dependency, so they are unit tested on their own.
- Keys are case sensitive, like env variables on Linux and macOS.
- Empty is reported only for keys that also exist in the template.
- The extension reads two local files and makes no network calls.

## Development

```
npm install
npm test
npm run build
```

Press F5 in VS Code to run the extension in a test window.

## License

MIT
