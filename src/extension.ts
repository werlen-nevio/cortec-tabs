import * as vscode from 'vscode';
import { SettingsViewProvider } from './settings';

export function activate(context: vscode.ExtensionContext) {
    // Handel old colors
    // TODO: Handle new settings
    const provider: vscode.FileDecorationProvider = {
        provideFileDecoration(uri) {
            const filePath = uri.fsPath;
            const config = vscode.workspace.getConfiguration('cortecColors');
            const bootColor = config.get<string>('bootColor', '#77021d');

            if (filePath.includes('/boot/') || filePath.includes('\\boot\\')) {
                return {
                    color: new vscode.ThemeColor('cortec.boot'),
                    propagate: true
                };
            }

            if (filePath.includes('/clients-bootstrap/') || filePath.includes('\\clients-bootstrap\\')) {
                return {
                    badge: '🍿',
                    color: new vscode.ThemeColor('cortec.clientsbootstrap'),
                };
            }

            if (filePath.includes('/globalincludes/') || filePath.includes('\\globalincludes\\')) {
                return {
                    badge: '⚙️',
                    color: new vscode.ThemeColor('cortec.globalincludes'),
                };
            }

            return undefined;
        }
    };

    const decorationDisposable = vscode.window.registerFileDecorationProvider(provider);
    context.subscriptions.push(decorationDisposable);

    // Register Webview View for settings
    const settingsViewProvider = new SettingsViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SettingsViewProvider.viewType, settingsViewProvider)
    );

    // TODO: React after settings change
}

export function deactivate() {}
