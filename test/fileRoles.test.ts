import { describe, expect, it } from 'vitest';
import { getFileRole } from '../src/compare/fileRoles';

describe('getFileRole', () => {
  it('recognizes env files', () => {
    expect(getFileRole('.env')).toBe('env');
    expect(getFileRole('.env.local')).toBe('env');
  });

  it('recognizes template files', () => {
    expect(getFileRole('.env.template')).toBe('template');
    expect(getFileRole('.env.example')).toBe('template');
    expect(getFileRole('.env.sample')).toBe('template');
  });

  it('ignores the case of the file name', () => {
    expect(getFileRole('.ENV')).toBe('env');
    expect(getFileRole('.Env.Example')).toBe('template');
  });

  it('returns undefined for other files', () => {
    expect(getFileRole('.env.production')).toBeUndefined();
    expect(getFileRole('env')).toBeUndefined();
    expect(getFileRole('config.json')).toBeUndefined();
    expect(getFileRole('')).toBeUndefined();
  });
});
