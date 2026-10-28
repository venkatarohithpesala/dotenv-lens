import * as vscode from 'vscode';
import { compareEnv } from '../compare/compareEnv';
import { ENV_FILE_NAMES, TEMPLATE_FILE_NAMES, getFileRole } from '../compare/fileRoles';
import { parseEnv } from '../parser/parseEnv';
import { findExistingFiles, pickFile, readText } from './findEnvFiles';
import { showReport } from './showReport';

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('DotEnv Lens');
  const command = vscode.commands.registerCommand('dotenvlens.compare', (resource?: vscode.Uri) =>
    runCompare(output, resource),
  );
  context.subscriptions.push(output, command);
}

export function deactivate(): void {}

async function runCompare(output: vscode.OutputChannel, resource?: vscode.Uri): Promise<void> {
  const root = resource
    ? vscode.Uri.joinPath(resource, '..')
    : vscode.workspace.workspaceFolders?.[0]?.uri;
  if (!root) {
    void vscode.window.showErrorMessage('DotEnv Lens: open a folder first.');
    return;
  }

  const clickedName = resource ? (resource.path.split('/').pop() ?? '') : '';
  const role = getFileRole(clickedName);
  const where = resource ? 'the same folder' : 'the workspace root';

  const [foundEnvNames, foundTemplateNames] = await Promise.all([
    findExistingFiles(root, ENV_FILE_NAMES),
    findExistingFiles(root, TEMPLATE_FILE_NAMES),
  ]);
  const envNames = role === 'env' ? [clickedName] : foundEnvNames;
  const templateNames = role === 'template' ? [clickedName] : foundTemplateNames;

  if (envNames.length === 0) {
    void vscode.window.showWarningMessage(
      `DotEnv Lens: no env file found in ${where} (looked for ${ENV_FILE_NAMES.join(', ')}).`,
    );
    return;
  }
  if (templateNames.length === 0) {
    void vscode.window.showWarningMessage(
      `DotEnv Lens: no template file found in ${where} (looked for ${TEMPLATE_FILE_NAMES.join(', ')}).`,
    );
    return;
  }

  const envName = await pickFile(envNames, 'Select the env file');
  if (!envName) {
    return;
  }
  const templateName = await pickFile(templateNames, 'Select the template file');
  if (!templateName) {
    return;
  }

  try {
    const [envText, templateText] = await Promise.all([
      readText(root, envName),
      readText(root, templateName),
    ]);
    const result = compareEnv(parseEnv(envText), parseEnv(templateText));
    showReport(output, envName, templateName, result);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(`DotEnv Lens: ${reason}`);
  }
}
