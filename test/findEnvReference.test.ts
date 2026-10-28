import { describe, expect, it } from 'vitest';
import { findEnvReference } from '../src/hover/findEnvReference';

describe('findEnvReference', () => {
  it('finds a dotted reference under the cursor', () => {
    const line = 'const url = process.env.DATABASE_URL;';
    expect(findEnvReference(line, line.indexOf('DATABASE'))).toEqual({
      name: 'DATABASE_URL',
      start: line.indexOf('process'),
      end: line.indexOf(';'),
    });
  });

  it('finds a reference written with single quoted brackets', () => {
    const line = "const port = process.env['PORT'];";
    expect(findEnvReference(line, line.indexOf('PORT'))?.name).toBe('PORT');
  });

  it('finds a reference written with double quoted brackets and spaces', () => {
    const line = 'const port = process.env[ "PORT" ];';
    expect(findEnvReference(line, line.indexOf('PORT'))?.name).toBe('PORT');
  });

  it('matches when the cursor is on the process keyword', () => {
    const line = 'x = process.env.A';
    expect(findEnvReference(line, line.indexOf('process'))?.name).toBe('A');
  });

  it('matches when the cursor is at the end of the reference', () => {
    const line = 'x = process.env.A;';
    expect(findEnvReference(line, line.indexOf(';'))?.name).toBe('A');
  });

  it('returns undefined when the cursor is outside any reference', () => {
    const line = 'const url = process.env.DATABASE_URL;';
    expect(findEnvReference(line, 2)).toBeUndefined();
  });

  it('picks the reference under the cursor when there are several', () => {
    const line = 'const a = process.env.FIRST + process.env.SECOND;';
    expect(findEnvReference(line, line.indexOf('FIRST'))?.name).toBe('FIRST');
    expect(findEnvReference(line, line.indexOf('SECOND'))?.name).toBe('SECOND');
  });

  it('accepts lower case names', () => {
    const line = 'process.env.node_env';
    expect(findEnvReference(line, 14)?.name).toBe('node_env');
  });

  it('ignores lookalikes', () => {
    expect(findEnvReference('process.environment.A', 18)).toBeUndefined();
    expect(findEnvReference('myprocess.env.A', 13)).toBeUndefined();
    expect(findEnvReference('const env = process.env;', 15)).toBeUndefined();
    expect(findEnvReference('process.env.1ABC', 14)).toBeUndefined();
  });
});
