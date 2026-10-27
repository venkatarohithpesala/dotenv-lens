import * as vscode from 'vscode';
import type { CompareResult } from '../compare/compareEnv';
import { formatReport, formatSummary, isClean } from '../compare/formatReport';

export function showReport(
  output: vscode.OutputChannel,
  envName: string,
  templateName: string,
  result: CompareResult,
): void {
  output.clear();
  output.appendLine(formatReport(envName, templateName, result));
  output.show(true);

  const message = `Env Compare: ${formatSummary(result)}`;
  if (isClean(result)) {
    void vscode.window.showInformationMessage(message);
  } else {
    void vscode.window.showWarningMessage(message);
  }
}
