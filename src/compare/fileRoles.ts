export const ENV_FILE_NAMES = ['.env', '.env.local'];
export const TEMPLATE_FILE_NAMES = ['.env.template', '.env.example', '.env.sample'];

export type FileRole = 'env' | 'template';

export function getFileRole(fileName: string): FileRole | undefined {
  const name = fileName.toLowerCase();
  if (ENV_FILE_NAMES.includes(name)) {
    return 'env';
  }
  if (TEMPLATE_FILE_NAMES.includes(name)) {
    return 'template';
  }
  return undefined;
}
