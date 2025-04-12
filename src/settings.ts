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
                    vscode.commands.executeCommand('cortecColors.refreshDecorations');
                    updateWebview();
                    break;

                case 'deleteEntry':
                    entries.splice(message.index, 1);
                    await this.context.globalState.update('folderColors', entries);
                    vscode.commands.executeCommand('cortecColors.refreshDecorations');
                    updateWebview();
                    break;

                case 'getEntries':
                    updateWebview();
                    break;
            }
        });

        updateWebview();
    }

    private getHexColor(color: string): string {
        const colorMap: { [key: string]: string } = {
            'Red Orange': '#FF5733',
            'Red': '#FF0000',
            'Hot Pink': '#FF69B4',
            'Yellow': '#FFC300',
            'Lemon Yellow': '#FFFF00',
            'Lime Green': '#75FF33',
            'Green': '#008000',
            'Turquoise': '#00CED1',
            'Sky Blue': '#33C1FF',
            'VS Code Blue': '#007ACC',
            'Blue': '#0000FF',
            'Indigo': '#4B0082',
            'Purple': '#800080',
            'Violet': '#C700FF',
            'Magenta': '#FF33A6',
            'White': '#FFFFFF',
            'Light Gray': '#D3D3D3',
            'Gray': '#888888',
            'Dark Gray': '#444444',
            'Black': '#000000'
        };

        return colorMap[color] || '#000000';
    }

    private getHtml(entries: any[]): string {
        const rows = entries.map((entry, index) => `
            <tr>
                <td>${entry.name}</td>
                <td><span style="color:${this.getHexColor(entry.color)}; padding: 2px 6px; border-radius: 4px;">${entry.color}</span></td>
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

                    input, select, button {
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
                <input id="name" type="text" />

                <label>Color</label>
                <select id="color">
                    <option style="color: #FF5733" value="Red Orange">Red Orange</option>
                    <option style="color: #FF0000" value="Red">Red</option>
                    <option style="color: #FF69B4" value="Hot Pink">Hot Pink</option>
                    <option style="color: #FFC300" value="Yellow">Yellow</option>
                    <option style="color: #FFFF00" value="Lemon Yellow">Lemon Yellow</option>
                    <option style="color: #75FF33" value="Lime Green">Lime Green</option>
                    <option style="color: #008000" value="Green">Green</option>
                    <option style="color: #00CED1" value="Turquoise">Turquoise</option>
                    <option style="color: #33C1FF" value="Sky Blue">Sky Blue</option>
                    <option style="color: #007ACC" value="VS Code Blue">VS Code Blue</option>
                    <option style="color: #0000FF" value="Blue">Blue</option>
                    <option style="color: #4B0082" value="Indigo">Indigo</option>
                    <option style="color: #800080" value="Purple">Purple</option>
                    <option style="color: #C700FF" value="Violet">Violet</option>
                    <option style="color: #FF33A6" value="Magenta">Magenta</option>
                    <option style="color: #FFFFFF" value="White">White</option>
                    <option style="color: #D3D3D3" value="Light Gray">Light Gray</option>
                    <option style="color: #888888" value="Gray">Gray</option>
                    <option style="color: #444444" value="Dark Gray">Dark Gray</option>
                    <option style="color: #000000" value="Black">Black</option>
                </select>

                <label>Badge</label>
                <input id="badge" type="text" />

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

                        document.getElementById('name').value = '';
                        document.getElementById('color').value = '#FF5733';
                        document.getElementById('badge').value = '';
                        document.getElementById('editIndex').value = '';
                    }

                    function rgbToHex(rgb) {
                        const result = rgb.match(/\\d+/g);
                        if (!result) return "#000000";
                        return "#" + result.map(x => {
                            const hex = parseInt(x).toString(16);
                            return hex.length === 1 ? "0" + hex : hex;
                        }).join("");
                    }

                    function edit(index) {
                        const row = document.querySelectorAll("tbody tr")[index * 2];
                        const cells = row.getElementsByTagName("td");

                        document.getElementById('name').value = cells[0].innerText;
                        const span = cells[1].querySelector('span');
                        const computedColor = span.textContent;
                        document.getElementById('color').value = computedColor;
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