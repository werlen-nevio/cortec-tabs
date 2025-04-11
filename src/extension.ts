import * as vscode from 'vscode';
import { SettingsViewProvider } from './settings';

export function activate(context: vscode.ExtensionContext) {
    const provider: vscode.FileDecorationProvider = {
        provideFileDecoration(uri: vscode.Uri): vscode.ProviderResult<vscode.FileDecoration> {
            const filePath = uri.fsPath.toLowerCase();
            const entries = context.globalState.get<any[]>('folderColors') || [];

            for (const entry of entries) {
                if (filePath.includes(entry.name.toLowerCase())) {
                    return {
                        badge: entry.badge || undefined,
                        color: entry.color ? new vscode.ThemeColor(`cortec.folderColor.${entry.name.toLowerCase()}`) : undefined,
                        propagate: true
                    };
                }
            }

            return undefined;
        }
    };

    const providerDisposable = vscode.window.registerFileDecorationProvider(provider);
    context.subscriptions.push(providerDisposable);

    // Webview-Provider registrieren
    const settingsViewProvider = new SettingsViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SettingsViewProvider.viewType, settingsViewProvider)
    );

    // Event-Listener, um manuell refresh zu triggern
    vscode.commands.registerCommand('cortecColors.refreshDecorations', () => {
        // Trick: Re-registrieren, um Änderung zu triggern
        providerDisposable.dispose();
        const newProvider = vscode.window.registerFileDecorationProvider(provider);
        context.subscriptions.push(newProvider);
    });
}

export function deactivate() {}
