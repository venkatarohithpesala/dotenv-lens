import * as vscode from 'vscode';
import { TEMPLATE_FILE_NAMES } from '../compare/fileRoles';
import type { EnvSource } from '../hover/hoverContent';
import { parseEnv } from '../parser/parseEnv';
import { readText } from './findEnvFiles';

const HOVER_ENV_FILES = ['.env.local', '.env'];

export class EnvStore implements vscode.Disposable {
  private env: EnvSource[] = [];
  private templates: EnvSource[] = [];
  private readonly watcher: vscode.FileSystemWatcher;

  constructor(private readonly root: vscode.Uri) {
    this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(root, '.env*'));
    const reload = () => void this.load();
    this.watcher.onDidChange(reload);
    this.watcher.onDidCreate(reload);
    this.watcher.onDidDelete(reload);
  }

  getEnv(): EnvSource[] {
    return this.env;
  }

  getTemplates(): EnvSource[] {
    return this.templates;
  }

  async load(): Promise<void> {
    const [env, templates] = await Promise.all([
      loadSources(this.root, HOVER_ENV_FILES),
      loadSources(this.root, TEMPLATE_FILE_NAMES),
    ]);
    this.env = env;
    this.templates = templates;
  }

  dispose(): void {
    this.watcher.dispose();
  }
}

async function loadSources(root: vscode.Uri, names: string[]): Promise<EnvSource[]> {
  const sources = await Promise.all(
    names.map(async (fileName): Promise<EnvSource | undefined> => {
      try {
        return { fileName, values: parseEnv(await readText(root, fileName)).values };
      } catch {
        return undefined;
      }
    }),
  );
  return sources.filter((source): source is EnvSource => source !== undefined);
}
