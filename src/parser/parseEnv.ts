export interface ParsedEnv {
  values: Map<string, string>;
  duplicates: string[];
}

const KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
const EXPORT_PREFIX = /^export\s+/;

export function parseEnv(text: string): ParsedEnv {
  const values = new Map<string, string>();
  const duplicates = new Set<string>();
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).replace(EXPORT_PREFIX, '').trim();
    if (!KEY_PATTERN.test(key)) {
      continue;
    }

    if (values.has(key)) {
      duplicates.add(key);
    }
    values.set(key, parseValue(line.slice(separator + 1)));
  }

  return { values, duplicates: [...duplicates] };
}

function parseValue(raw: string): string {
  const text = raw.trim();
  const quote = text[0];

  if (quote === '"' || quote === "'") {
    const end = findClosingQuote(text, quote);
    if (end === -1) {
      return text.slice(1);
    }
    const inner = text.slice(1, end);
    return quote === '"' ? unescapeDoubleQuoted(inner) : inner;
  }

  const comment = raw.search(/\s#/);
  return (comment === -1 ? raw : raw.slice(0, comment)).trim();
}

function findClosingQuote(text: string, quote: string): number {
  for (let i = 1; i < text.length; i++) {
    if (quote === '"' && text[i] === '\\') {
      i++;
    } else if (text[i] === quote) {
      return i;
    }
  }
  return -1;
}

function unescapeDoubleQuoted(inner: string): string {
  return inner.replace(/\\(["\\n])/g, (_, char: string) => (char === 'n' ? '\n' : char));
}
