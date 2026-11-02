import { describe, expect, it } from 'vitest';
import { buildHover, resolveEnv, type EnvSource } from '../src/hover/hoverContent';

function source(fileName: string, entries: Record<string, string>): EnvSource {
  return { fileName, values: new Map(Object.entries(entries)) };
}

describe('resolveEnv', () => {
  it('prefers the first env source that defines the key', () => {
    const resolved = resolveEnv(
      'PORT',
      [source('.env.local', { PORT: '5000' }), source('.env', { PORT: '3000' })],
      [],
    );
    expect(resolved).toEqual({ found: true, value: '5000', source: '.env.local' });
  });

  it('falls back to later sources', () => {
    const resolved = resolveEnv('PORT', [source('.env.local', {}), source('.env', { PORT: '3000' })], []);
    expect(resolved).toEqual({ found: true, value: '3000', source: '.env' });
  });

  it('reports the files checked and the template when the key is missing', () => {
    const resolved = resolveEnv('REDIS_URL', [source('.env', {})], [source('.env.example', { REDIS_URL: '' })]);
    expect(resolved).toEqual({ found: false, checked: ['.env'], templateName: '.env.example' });
  });

  it('reports no template when no template lists the key', () => {
    const resolved = resolveEnv('X', [source('.env', {})], [source('.env.example', { Y: '' })]);
    expect(resolved).toEqual({ found: false, checked: ['.env'], templateName: undefined });
  });
});

describe('buildHover', () => {
  it('shows the value and its source', () => {
    const resolved = { found: true as const, value: '3000', source: '.env' };
    expect(buildHover('PORT', resolved, true)).toEqual({
      status: 'found',
      title: 'PORT',
      value: '3000',
      note: 'From .env.',
    });
  });

  it('masks secret-looking values when masking is on', () => {
    const resolved = { found: true as const, value: 'changeme123', source: '.env' };
    const content = buildHover('API_KEY', resolved, true);
    expect(content.value).toBe('********');
    expect(content.note).toContain('Masked');
    expect(content.note).toContain('dotenvlens.maskSecrets');
  });

  it('shows secret-looking values when masking is off', () => {
    const resolved = { found: true as const, value: 'changeme123', source: '.env' };
    expect(buildHover('API_KEY', resolved, false)).toEqual({
      status: 'found',
      title: 'API_KEY',
      value: 'changeme123',
      note: 'From .env.',
    });
  });

  it('masks a connection url password', () => {
    const resolved = { found: true as const, value: 'postgres://u:changeme@host/db', source: '.env' };
    expect(buildHover('DATABASE_URL', resolved, true).value).toBe('postgres://u:********@host/db');
  });

  it('describes an empty value without a value block', () => {
    const resolved = { found: true as const, value: '', source: '.env' };
    expect(buildHover('API_KEY', resolved, true)).toEqual({
      status: 'empty',
      title: 'API_KEY',
      note: 'Empty value in .env.',
    });
  });

  it('says where a missing key was looked for', () => {
    const resolved = { found: false as const, checked: ['.env.local', '.env'] };
    const content = buildHover('X', resolved, true);
    expect(content.note).toBe('Not set in .env.local or .env.');
    expect(content.status).toBe('missing');
  });

  it('mentions the template when it lists the missing key', () => {
    const resolved = { found: false as const, checked: ['.env'], templateName: '.env.example' };
    expect(buildHover('REDIS_URL', resolved, true).note).toBe(
      'Not set in .env. It is listed in .env.example.',
    );
  });

  it('handles a workspace with no env file', () => {
    const resolved = { found: false as const, checked: [] };
    expect(buildHover('X', resolved, true).note).toBe('No env file found in the workspace root.');
  });
});
