import { describe, expect, it } from 'vitest';
import { isSecretName, maskValue } from '../src/hover/maskValue';

describe('isSecretName', () => {
  it('flags secret-looking names', () => {
    for (const name of ['API_KEY', 'JWT_SECRET', 'AUTH_TOKEN', 'DB_PASSWORD', 'PRIVATE_KEY', 'aws_secret']) {
      expect(isSecretName(name)).toBe(true);
    }
  });

  it('leaves ordinary names alone', () => {
    for (const name of ['PORT', 'NODE_ENV', 'APP_NAME', 'DATABASE_URL']) {
      expect(isSecretName(name)).toBe(false);
    }
  });
});

describe('maskValue', () => {
  it('masks the whole value of a secret-looking name', () => {
    expect(maskValue('API_KEY', 'changeme123')).toBe('********');
  });

  it('does not reveal the length of the secret', () => {
    expect(maskValue('API_KEY', 'a')).toBe(maskValue('API_KEY', 'a-much-longer-value'));
  });

  it('keeps an empty value empty', () => {
    expect(maskValue('API_KEY', '')).toBe('');
  });

  it('leaves ordinary values unchanged', () => {
    expect(maskValue('PORT', '3000')).toBe('3000');
    expect(maskValue('APP_NAME', 'Demo App')).toBe('Demo App');
  });

  it('masks the password inside a connection url', () => {
    expect(maskValue('DATABASE_URL', 'postgres://user:changeme@localhost:5432/demo')).toBe(
      'postgres://user:********@localhost:5432/demo',
    );
  });

  it('leaves a url without credentials unchanged', () => {
    expect(maskValue('API_URL', 'http://localhost:3000/api')).toBe('http://localhost:3000/api');
  });
});
