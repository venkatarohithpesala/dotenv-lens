import { describe, expect, it } from 'vitest';
import type { CompareResult } from '../src/compare/compareEnv';
import { formatReport, formatSummary, isClean } from '../src/compare/formatReport';

function result(overrides: Partial<CompareResult> = {}): CompareResult {
  return {
    missing: [],
    extra: [],
    empty: [],
    envDuplicates: [],
    templateDuplicates: [],
    ...overrides,
  };
}

describe('isClean', () => {
  it('is true when there are no differences', () => {
    expect(isClean(result())).toBe(true);
  });

  it('ignores duplicate warnings', () => {
    expect(isClean(result({ envDuplicates: ['A'] }))).toBe(true);
  });

  it('is false when any list has keys', () => {
    expect(isClean(result({ missing: ['A'] }))).toBe(false);
    expect(isClean(result({ extra: ['A'] }))).toBe(false);
    expect(isClean(result({ empty: ['A'] }))).toBe(false);
  });
});

describe('formatSummary', () => {
  it('reports a clean result', () => {
    expect(formatSummary(result())).toBe('no differences found.');
  });

  it('reports the count of each kind', () => {
    const summary = formatSummary(result({ missing: ['A', 'B'], extra: ['C'], empty: ['D'] }));
    expect(summary).toBe('2 missing, 1 extra, 1 empty.');
  });
});

describe('formatReport', () => {
  it('formats a full report', () => {
    const text = formatReport(
      '.env',
      '.env.example',
      result({
        missing: ['DATABASE_URL', 'REDIS_URL'],
        extra: ['OLD_KEY'],
        empty: ['API_KEY'],
        envDuplicates: ['PORT'],
        templateDuplicates: ['HOST', 'MODE'],
      }),
    );

    expect(text).toBe(
      [
        'Env Compare: .env vs .env.example',
        '',
        'Missing from .env (present in .env.example) (2)',
        '  DATABASE_URL',
        '  REDIS_URL',
        '',
        'Extra in .env (not in .env.example) (1)',
        '  OLD_KEY',
        '',
        'Empty in .env (1)',
        '  API_KEY',
        '',
        'Duplicate keys (last value wins)',
        '  .env: PORT',
        '  .env.example: HOST, MODE',
      ].join('\n'),
    );
  });

  it('says so when nothing differs', () => {
    expect(formatReport('.env', '.env.template', result())).toBe(
      'Env Compare: .env vs .env.template\n\nNo missing, extra, or empty keys.',
    );
  });

  it('omits sections that have no keys', () => {
    const text = formatReport('.env', '.env.template', result({ extra: ['A'] }));
    expect(text).not.toContain('Missing');
    expect(text).not.toContain('Empty');
    expect(text).toContain('Extra in .env (not in .env.template) (1)');
  });

  it('still lists duplicates when the comparison is clean', () => {
    const text = formatReport('.env', '.env.template', result({ envDuplicates: ['A'] }));
    expect(text).toContain('Duplicate keys (last value wins)');
    expect(text).toContain('No missing, extra, or empty keys.');
  });
});
