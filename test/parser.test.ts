import { describe, expect, it } from 'vitest';
import { parseEnv } from '../src/parser/parseEnv';

function values(text: string): Record<string, string> {
  return Object.fromEntries(parseEnv(text).values);
}

describe('parseEnv', () => {
  it('parses simple key value pairs', () => {
    expect(values('API_URL=http://localhost\nPORT=3000')).toEqual({
      API_URL: 'http://localhost',
      PORT: '3000',
    });
  });

  it('returns nothing for empty input', () => {
    const result = parseEnv('');
    expect(result.values.size).toBe(0);
    expect(result.duplicates).toEqual([]);
  });

  it('ignores comments and blank lines', () => {
    const text = '# header\n\n   \n  # indented comment\nA=1\n';
    expect(values(text)).toEqual({ A: '1' });
  });

  it('ignores lines without an equals sign', () => {
    expect(values('not a pair\nA=1')).toEqual({ A: '1' });
  });

  it('ignores lines with an invalid key', () => {
    expect(values('1BAD=x\nBAD KEY=x\n=x\nGOOD=y')).toEqual({ GOOD: 'y' });
  });

  it('strips the export prefix', () => {
    expect(values('export A=1\nexport   B=2')).toEqual({ A: '1', B: '2' });
  });

  it('keeps a key that merely starts with export', () => {
    expect(values('EXPORT_DIR=out\nexporter=1')).toEqual({ EXPORT_DIR: 'out', exporter: '1' });
  });

  it('handles double quoted values', () => {
    expect(values('A="hello world"')).toEqual({ A: 'hello world' });
  });

  it('handles single quoted values', () => {
    expect(values("A='hello world'")).toEqual({ A: 'hello world' });
  });

  it('keeps a hash inside quotes', () => {
    expect(values('A="x # y"\nB=\'x # y\'')).toEqual({ A: 'x # y', B: 'x # y' });
  });

  it('unescapes double quoted values only', () => {
    expect(values('A="say \\"hi\\"\\\\n"\nB=\'a\\nb\'')).toEqual({
      A: 'say "hi"\\n',
      B: 'a\\nb',
    });
  });

  it('converts \\n in double quotes to a newline', () => {
    expect(values('A="one\\ntwo"')).toEqual({ A: 'one\ntwo' });
  });

  it('ignores text after the closing quote', () => {
    expect(values('A="value" # note')).toEqual({ A: 'value' });
  });

  it('treats an unclosed quote as the rest of the line', () => {
    expect(values('A="never closed')).toEqual({ A: 'never closed' });
  });

  it('keeps equals signs inside values', () => {
    expect(values('URL=postgres://host/db?sslmode=require&x=1')).toEqual({
      URL: 'postgres://host/db?sslmode=require&x=1',
    });
  });

  it('keeps a trailing equals in base64 style values', () => {
    expect(values('TOKEN=YWJjZA==')).toEqual({ TOKEN: 'YWJjZA==' });
  });

  it('strips inline comments from unquoted values', () => {
    expect(values('A=value # note')).toEqual({ A: 'value' });
  });

  it('keeps a hash that is not preceded by whitespace', () => {
    expect(values('A=abc#def\nB=#abc')).toEqual({ A: 'abc#def', B: '#abc' });
  });

  it('treats a comment after the equals sign as an empty value', () => {
    expect(values('A= # nothing here')).toEqual({ A: '' });
  });

  it('reads empty values', () => {
    expect(values('A=\nB=""\nC=\'\'\nD=   ')).toEqual({ A: '', B: '', C: '', D: '' });
  });

  it('trims whitespace around keys and values', () => {
    expect(values('  A  =  value  ')).toEqual({ A: 'value' });
  });

  it('handles CRLF line endings', () => {
    expect(values('A=1\r\nB=2\r\n')).toEqual({ A: '1', B: '2' });
  });

  it('strips a leading byte order mark', () => {
    expect(values('﻿A=1')).toEqual({ A: '1' });
  });

  it('lets the last duplicate win and reports it once', () => {
    const result = parseEnv('A=1\nB=2\nA=3\nA=4');
    expect(result.values.get('A')).toBe('4');
    expect(result.duplicates).toEqual(['A']);
  });

  it('reports no duplicates when keys are unique', () => {
    expect(parseEnv('A=1\nB=2').duplicates).toEqual([]);
  });
});
