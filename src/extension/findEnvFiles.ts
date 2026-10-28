import * as vscode from 'vscode';

export async function findExistingFiles(root: vscode.Uri, names: string[]): Promise<string[]> {
  const flags = await Promise.all(names.map((name) => isFile(vscode.Uri.joinPath(root, name))));
  return names.filter((_, index) => flags[index]);
}

export async function pickFile(names: string[], placeHolder: string): Promise<string | undefined> {
  if (names.length === 1) {
    return names[0];
  }
  return vscode.window.showQuickPick(names, { placeHolder });
}

export async function readText(root: vscode.Uri, name: string): Promise<string> {
  try {
    const bytes = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(root, name));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`could not read ${name}: ${reason}`);
  }
}

async function isFile(uri: vscode.Uri): Promise<boolean> {
  try {
    const stat = await vscode.workspace.fs.stat(uri);
    return (stat.type & vscode.FileType.File) !== 0;
  } catch {
    return false;
  }
}
