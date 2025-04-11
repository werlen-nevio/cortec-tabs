import * as vscode from 'vscode';

export class SettingsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'folderColorSettings';

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        const webview = webviewView.webview;
        webview.options = { enableScripts: true };

        const updateWebview = () => {
            const data = this.context.globalState.get<any[]>('folderColors') || [];
            webview.html = this.getHtml(data);
        };

        webview.onDidReceiveMessage(async (message) => {
            let entries = this.context.globalState.get<any[]>('folderColors') || [];

            switch (message.command) {
                case 'saveEntry':
                    if (message.editIndex !== undefined) {
                        entries[message.editIndex] = {
                        name: message.name,
                        color: message.color,
                        badge: message.badge
                        };
                    } else {
                        entries.push({
                        name: message.name,
                        color: message.color,
                        badge: message.badge
                        });
                    }

                    await this.context.globalState.update('folderColors', entries);
                    updateWebview();
                    break;
                case 'deleteEntry':
                    entries.splice(message.index, 1);
                    await this.context.globalState.update('folderColors', entries);
                    updateWebview();
                    break;
                case 'getEntries':
                    updateWebview();
                    break;
            }
        });

        updateWebview();
    }

    private getHtml(entries: any[]): string {
        const rows = entries.map((entry, index) => `
            <tr>
                <td>${entry.name}</td>
                <td><span style="background:${entry.color}; padding: 2px 6px; border-radius: 4px;">${entry.color}</span></td>
                <td>${entry.badge}</td>
            </tr>
            <tr>
                <td colspan="3" style="text-align: center;">
                    <button class="btn-action" onclick="edit(${index})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-action delete" onclick="del(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html lang="de">
                <head>
                    <meta charset="UTF-8">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
                    <style>
                        body {
                            font-family: sans-serif;
                            padding: 10px;
                            color: var(--vscode-foreground);
                            background-color: var(--vscode-editor-background);
                        }

                        input, button {
                            margin: 5px 0;
                            padding: 6px;
                            width: 100%;
                            box-sizing: border-box;
                            color: var(--vscode-input-foreground);
                            background-color: var(--vscode-input-background);
                            border: 1px solid var(--vscode-input-border);
                        }

                        button {
                            background-color: var(--vscode-button-background);
                            color: var(--vscode-button-foreground);
                            border: none;
                            cursor: pointer;
                            transition: background 0.2s ease;
                        }

                        button:hover {
                            background-color: var(--vscode-button-hoverBackground);
                        }

                        table {
                            width: 100%;
                            margin-top: 20px;
                            border-collapse: collapse;
                        }

                        th, td {
                            border: 1px solid var(--vscode-editorWidget-border);
                            padding: 8px;
                            text-align: center;
                        }

                        th {
                            background: var(--vscode-editorWidget-background);
                            color: var(--vscode-editorWidget-foreground);
                        }

                        .btn-action {
                            border: none;
                            cursor: pointer;
                            color: var(--vscode-button-foreground);
                            width: 30%;
                        }

                        .btn-action.delete {
                            background-color: red;
                        }
                    </style>
                </head>
                <body>
                    <h2>Folder Color Settings</h2>        
                    <label>Name</label>
                    <input id="name" type="text"/>

                    <label>Color</label>
                    <input id="color" type="color"/>

                    <label>Badge</label>
                    <input id="badge" type="text"/>

                    <input type="hidden" id="editIndex" />

                    <button onclick="save()">Save</button>

                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Color</th>
                                <th>Badge</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <script>
                        const vscode = acquireVsCodeApi();

                        function save() {
                            const name = document.getElementById('name').value;
                            const color = document.getElementById('color').value;
                            const badge = document.getElementById('badge').value;
                            const editIndex = document.getElementById('editIndex').value;

                            vscode.postMessage({
                            command: 'saveEntry',
                            name,
                            color,
                            badge,
                            editIndex: editIndex ? parseInt(editIndex) : undefined
                            });

                            // Reset fields
                            document.getElementById('name').value = '';
                            document.getElementById('color').value = '#000000';
                            document.getElementById('badge').value = '';
                            document.getElementById('editIndex').value = '';
                        }

                        function edit(index) {
                            const row = document.querySelectorAll("tbody tr")[index];
                            const cells = row.getElementsByTagName("td");

                            document.getElementById('name').value = cells[0].innerText;
                            document.getElementById('color').value = cells[1].innerText.trim();
                            document.getElementById('badge').value = cells[2].innerText;
                            document.getElementById('editIndex').value = index;
                        }

                        function del(index) {
                            vscode.postMessage({ command: 'deleteEntry', index });
                        }
                    </script>
                </body>
            </html>
        `;
    }
}