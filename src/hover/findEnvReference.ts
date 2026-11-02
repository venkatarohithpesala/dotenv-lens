export interface EnvReference {
  name: string;
  start: number;
  end: number;
}

const ENV_ACCESS =
  /\bprocess\.env(?:\.([A-Za-z_][A-Za-z0-9_]*)|\[\s*(['"])([A-Za-z_][A-Za-z0-9_]*)\2\s*\])/g;

export function findEnvReference(line: string, character: number): EnvReference | undefined {
  for (const match of line.matchAll(ENV_ACCESS)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (character >= start && character <= end) {
      return { name: match[1] ?? match[3], start, end };
    }
  }
  return undefined;
}
