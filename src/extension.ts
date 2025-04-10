import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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

            if (filePath.includes('/boot/') || filePath.includes('\\clients-bootstrap\\')) {
                return {
                    badge: '🍿',
                    color: new vscode.ThemeColor('cortec.clientsbootstrap'),
                };
            }

            if (filePath.includes('/boot/') || filePath.includes('\\globalincludes\\')) {
                return {
                    badge: '⚙️',
                    color: new vscode.ThemeColor('cortec.globalincludes'),
                };
            }

            return undefined;
        }
    };

    const disposable = vscode.window.registerFileDecorationProvider(provider);
    context.subscriptions.push(disposable);

    // Update Theme Color at runtime (optional enhancement – not required unless dynamically applying the color)
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('cortecColors.bootColor')) {
            vscode.window.showInformationMessage('Boot-Farbe aktualisiert. Bitte neustarten für volle Wirkung.');
        }
    });
}

export function deactivate() {}
