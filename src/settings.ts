import * as vscode from 'vscode';

export class SettingsViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'folderColorSettings';

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = this.getHtml();
  }

  private getHtml(): string {
    return /* html */ `
      <html>
        <body>
          <h2 style="color: #ff007f;">Settings</h2>
          <p>Hier kannst du dein Theme konfigurieren.</p>
        </body>
      </html>
    `;
  }
}
