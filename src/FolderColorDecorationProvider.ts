import * as vscode from 'vscode';

export class FolderColorDecorationProvider implements vscode.FileDecorationProvider {
    // EventEmitter to communicate that decorations have changed
    private readonly _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    
    readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

    constructor(private readonly context: vscode.ExtensionContext) {}

    // Method for triggering a decoration update
    refresh(): void {
        this._onDidChangeFileDecorations.fire(undefined);
    }

    // This method returns decorations for specific paths/folders
    provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
        const filePath = uri.fsPath.toLowerCase();
        const entries = this.context.globalState.get<any[]>('folderColors') || [];

        for (const entry of entries) {
            // If the path contains the folder name (case-insensitive)
            if (filePath.includes(`/${entry.foldername.toLowerCase()}/`) || filePath.includes(`\\${entry.foldername.toLowerCase()}\\`)) {
                return {
                    color: new vscode.ThemeColor(`${entry.color.toLowerCase()}`),
                    propagate: true
                };
            }
        }

        return undefined;
    }
}