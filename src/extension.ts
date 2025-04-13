import * as vscode from 'vscode';
import { FolderColorDecorationProvider } from './FolderColorDecorationProvider';
import { SettingsViewProvider } from './settings';

export function activate(context: vscode.ExtensionContext) {
    const decorationProvider = new FolderColorDecorationProvider(context);

    // Registers the decoration provider to display custom colors
    context.subscriptions.push(
        vscode.window.registerFileDecorationProvider(decorationProvider)
    );

    // Creates the settings view and passes a callback to reload the decorations, once changes are made
    const settingsViewProvider = new SettingsViewProvider(context, () => {
        decorationProvider.refresh();
    });

    // Registers the Webview view
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SettingsViewProvider.viewType, settingsViewProvider)
    );

    // Registers a command to update the decorations
    vscode.commands.registerCommand('folderColors.refreshDecorations', () => {
        decorationProvider.refresh();
    });
}

export function deactivate() {}