import type { CompareResult } from './compareEnv';

export function isClean(result: CompareResult): boolean {
  return result.missing.length === 0 && result.extra.length === 0 && result.empty.length === 0;
}

export function formatSummary(result: CompareResult): string {
  if (isClean(result)) {
    return 'no differences found.';
  }
  const parts = [
    `${result.missing.length} missing`,
    `${result.extra.length} extra`,
    `${result.empty.length} empty`,
  ];
  return `${parts.join(', ')}.`;
}

export function formatReport(envName: string, templateName: string, result: CompareResult): string {
  const sections = [`DotEnv Lens: ${envName} vs ${templateName}`];

  addSection(sections, `Missing from ${envName}, present in ${templateName}`, result.missing);
  addSection(sections, `Extra in ${envName}, not in ${templateName}`, result.extra);
  addSection(sections, `Empty in ${envName}`, result.empty);

  const duplicates: string[] = [];
  if (result.envDuplicates.length > 0) {
    duplicates.push(`${envName}: ${result.envDuplicates.join(', ')}`);
  }
  if (result.templateDuplicates.length > 0) {
    duplicates.push(`${templateName}: ${result.templateDuplicates.join(', ')}`);
  }
  if (duplicates.length > 0) {
    sections.push(['Duplicate keys (last value wins)', ...duplicates.map(indent)].join('\n'));
  }

  if (isClean(result)) {
    sections.push('No missing, extra, or empty keys.');
  }

  return sections.join('\n\n');
}

function addSection(sections: string[], title: string, keys: string[]): void {
  if (keys.length === 0) {
    return;
  }
  sections.push([`${title} (${keys.length})`, ...keys.map(indent)].join('\n'));
}

function indent(line: string): string {
  return `  ${line}`;
}
