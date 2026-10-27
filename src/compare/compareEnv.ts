import type { ParsedEnv } from '../parser/parseEnv';

export interface CompareResult {
  missing: string[];
  extra: string[];
  empty: string[];
  envDuplicates: string[];
  templateDuplicates: string[];
}

export function compareEnv(env: ParsedEnv, template: ParsedEnv): CompareResult {
  const missing: string[] = [];
  const extra: string[] = [];
  const empty: string[] = [];

  for (const key of template.values.keys()) {
    if (!env.values.has(key)) {
      missing.push(key);
    }
  }

  for (const [key, value] of env.values) {
    if (!template.values.has(key)) {
      extra.push(key);
    } else if (value === '') {
      empty.push(key);
    }
  }

  return {
    missing,
    extra,
    empty,
    envDuplicates: env.duplicates,
    templateDuplicates: template.duplicates,
  };
}
