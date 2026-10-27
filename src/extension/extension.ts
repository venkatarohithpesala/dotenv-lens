import * as vscode from 'vscode';
import { compareEnv } from '../compare/compareEnv';
import { parseEnv } from '../parser/parseEnv';
import {
  ENV_FILE_NAMES,
  TEMPLATE_FILE_NAMES,
  findExistingFiles,
  pickFile,
  readText,
} from './findEnvFiles';
import { showReport } from './showReport';

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Env Compare');
  const command = vscode.commands.registerCommand('envCompare.compare', () => runCompare(output));
  context.subscriptions.push(output, command);
}

export function deactivate(): void {}

async function runCompare(output: vscode.OutputChannel): Promise<void> {
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) {
    void vscode.window.showErrorMessage('Env Compare: open a folder first.');
    return;
  }

  const [envNames, templateNames] = await Promise.all([
    findExistingFiles(folder.uri, ENV_FILE_NAMES),
    findExistingFiles(folder.uri, TEMPLATE_FILE_NAMES),
  ]);

  if (envNames.length === 0) {
    void vscode.window.showWarningMessage(
      `Env Compare: no env file found in the workspace root (looked for ${ENV_FILE_NAMES.join(', ')}).`,
    );
    return;
  }
  if (templateNames.length === 0) {
    void vscode.window.showWarningMessage(
      `Env Compare: no template file found in the workspace root (looked for ${TEMPLATE_FILE_NAMES.join(', ')}).`,
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
      readText(folder.uri, envName),
      readText(folder.uri, templateName),
    ]);
    const result = compareEnv(parseEnv(envText), parseEnv(templateText));
    showReport(output, envName, templateName, result);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    void vscode.window.showErrorMessage(`Env Compare: ${reason}`);
  }
}
