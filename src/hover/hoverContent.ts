import { maskValue } from './maskValue';

export interface EnvSource {
  fileName: string;
  values: Map<string, string>;
}

export type ResolvedEnv =
  | { found: true; value: string; source: string }
  | { found: false; checked: string[]; templateName?: string };

export interface HoverContent {
  status: 'found' | 'empty' | 'missing';
  title: string;
  value?: string;
  note: string;
}

export function resolveEnv(
  name: string,
  envSources: EnvSource[],
  templateSources: EnvSource[],
): ResolvedEnv {
  for (const source of envSources) {
    const value = source.values.get(name);
    if (value !== undefined) {
      return { found: true, value, source: source.fileName };
    }
  }
  const template = templateSources.find((source) => source.values.has(name));
  return {
    found: false,
    checked: envSources.map((source) => source.fileName),
    templateName: template?.fileName,
  };
}

export function buildHover(name: string, resolved: ResolvedEnv, maskSecrets: boolean): HoverContent {
  if (resolved.found) {
    if (resolved.value === '') {
      return { status: 'empty', title: name, note: `Empty value in ${resolved.source}.` };
    }
    const shown = maskSecrets ? maskValue(name, resolved.value) : resolved.value;
    const note =
      shown === resolved.value
        ? `From ${resolved.source}.`
        : `From ${resolved.source}. Masked by dotenvlens.maskSecrets.`;
    return { status: 'found', title: name, value: shown, note };
  }

  const listed = resolved.templateName ? ` It is listed in ${resolved.templateName}.` : '';
  if (resolved.checked.length === 0) {
    return { status: 'missing', title: name, note: `No env file found in the workspace root.${listed}` };
  }
  return {
    status: 'missing',
    title: name,
    note: `Not set in ${resolved.checked.join(' or ')}.${listed}`,
  };
}
