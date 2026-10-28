import * as vscode from 'vscode';
import { findEnvReference } from '../hover/findEnvReference';
import { buildHover, resolveEnv, type HoverContent } from '../hover/hoverContent';
import type { EnvStore } from './envStore';

const LANGUAGES = ['javascript', 'typescript', 'javascriptreact', 'typescriptreact'];

const STATUS_STYLE: Record<HoverContent['status'], { icon: string; color?: string }> = {
  found: { icon: 'key' },
  empty: { icon: 'warning', color: 'var(--vscode-editorWarning-foreground)' },
  missing: { icon: 'error', color: 'var(--vscode-editorError-foreground)' },
};

export function registerEnvHover(store: EnvStore): vscode.Disposable {
  return vscode.languages.registerHoverProvider(LANGUAGES, {
    provideHover(document, position) {
      const reference = findEnvReference(document.lineAt(position.line).text, position.character);
      if (!reference) {
        return undefined;
      }

      const maskSecrets = vscode.workspace
        .getConfiguration('dotenvlens')
        .get<boolean>('maskSecrets', false);
      const resolved = resolveEnv(reference.name, store.getEnv(), store.getTemplates());
      const content = buildHover(reference.name, resolved, maskSecrets);

      const style = STATUS_STYLE[content.status];
      const open = style.color ? `<span style="color:${style.color};">` : '';
      const close = style.color ? '</span>' : '';

      const markdown = new vscode.MarkdownString();
      markdown.supportThemeIcons = true;
      markdown.supportHtml = true;
      markdown.appendMarkdown(`${open}$(${style.icon}) **DotEnv Lens**${close}\n\n`);
      if (content.value !== undefined) {
        markdown.appendCodeblock(`${content.title}=${content.value}`, 'ini');
      } else {
        markdown.appendMarkdown(`**${content.title}**\n\n`);
      }
      markdown.appendMarkdown(open);
      markdown.appendText(content.note);
      markdown.appendMarkdown(close);

      const range = new vscode.Range(position.line, reference.start, position.line, reference.end);
      return new vscode.Hover(markdown, range);
    },
  });
}
