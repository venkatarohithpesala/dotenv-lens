import { describe, expect, it } from 'vitest';
import { compareEnv } from '../src/compare/compareEnv';
import { parseEnv } from '../src/parser/parseEnv';

function compare(env: string, template: string) {
  return compareEnv(parseEnv(env), parseEnv(template));
}

describe('compareEnv', () => {
  it('reports nothing when both files match', () => {
    const result = compare('A=1\nB=2', 'A=\nB=');
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual([]);
    expect(result.empty).toEqual([]);
  });

  it('reports keys in the template that are missing from env', () => {
    expect(compare('A=1', 'A=\nB=\nC=').missing).toEqual(['B', 'C']);
  });

  it('reports keys in env that are not in the template', () => {
    expect(compare('A=1\nB=2\nC=3', 'A=').extra).toEqual(['B', 'C']);
  });

  it('reports template keys with an empty value in env', () => {
    expect(compare('A=\nB=2\nC=""', 'A=\nB=\nC=').empty).toEqual(['A', 'C']);
  });

  it('does not report an empty extra key as empty', () => {
    const result = compare('A=1\nB=', 'A=');
    expect(result.extra).toEqual(['B']);
    expect(result.empty).toEqual([]);
  });

  it('does not report a missing key as empty', () => {
    const result = compare('', 'A=');
    expect(result.missing).toEqual(['A']);
    expect(result.empty).toEqual([]);
  });

  it('keeps the order of the source files', () => {
    const result = compare('Z=1\nA=1\nM=1', 'Y=\nB=\nA=');
    expect(result.missing).toEqual(['Y', 'B']);
    expect(result.extra).toEqual(['Z', 'M']);
  });

  it('treats a value of only whitespace in quotes as not empty', () => {
    expect(compare('A=" "', 'A=').empty).toEqual([]);
  });

  it('handles an empty env file', () => {
    const result = compare('', 'A=\nB=');
    expect(result.missing).toEqual(['A', 'B']);
    expect(result.extra).toEqual([]);
  });

  it('handles an empty template file', () => {
    const result = compare('A=1', '');
    expect(result.missing).toEqual([]);
    expect(result.extra).toEqual(['A']);
  });

  it('is case sensitive', () => {
    const result = compare('api_key=1', 'API_KEY=');
    expect(result.missing).toEqual(['API_KEY']);
    expect(result.extra).toEqual(['api_key']);
  });

  it('passes duplicate keys through for each file', () => {
    const result = compare('A=1\nA=2', 'B=1\nB=2');
    expect(result.envDuplicates).toEqual(['A']);
    expect(result.templateDuplicates).toEqual(['B']);
  });
});
