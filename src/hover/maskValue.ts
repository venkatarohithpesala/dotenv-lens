const SECRET_NAME = /(KEY|SECRET|TOKEN|PASSWORD|PASSWD|PWD|PRIVATE|CREDENTIAL|AUTH)/i;
const URL_PASSWORD = /(:\/\/[^/\s:@]+:)[^@\s]+(@)/;
const MASK = '********';

export function isSecretName(name: string): boolean {
  return SECRET_NAME.test(name);
}

export function maskValue(name: string, value: string): string {
  if (value === '') {
    return value;
  }
  if (isSecretName(name)) {
    return MASK;
  }
  return value.replace(URL_PASSWORD, `$1${MASK}$2`);
}
