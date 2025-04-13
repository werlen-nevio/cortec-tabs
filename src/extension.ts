import * as vscode from 'vscode';
import { SettingsViewProvider } from './settings';

export function activate(context: vscode.ExtensionContext) {
    const provider: vscode.FileDecorationProvider = {
        provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
            const filePath = uri.fsPath.toLowerCase();

            // Get the saved folder colors from global state
            const entries = context.globalState.get<any[]>('folderColors') || [];

            for (const entry of entries) {
                if (filePath.includes(entry.foldername.toLowerCase())) {
                    // If entrie matches entry, return a decoration with color
                    return {
                        color: new vscode.ThemeColor(`${entry.color.toLowerCase()}`),
                        propagate: true 
                    };
                }
            }

            return undefined;
        }
    };

    const providerDisposable = vscode.window.registerFileDecorationProvider(provider);
    context.subscriptions.push(providerDisposable);

    const settingsViewProvider = new SettingsViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SettingsViewProvider.viewType, settingsViewProvider)
    );

    // Register a command to refresh decorations
    vscode.commands.registerCommand('cortecColors.refreshDecorations', () => {
        providerDisposable.dispose();
        const newProvider = vscode.window.registerFileDecorationProvider(provider);
        context.subscriptions.push(newProvider);
    });
}

export function deactivate() {}