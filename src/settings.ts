import * as vscode from 'vscode';

export class SettingsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'folderColorSettings';

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly onUpdate?: () => void
    ) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        const webview = webviewView.webview;

        webview.options = { enableScripts: true };

        // Function for rendering the webview with current data
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
                            foldername: message.foldername,
                            color: message.color
                        };
                    } else {
                        entries.push({
                            foldername: message.foldername,
                            color: message.color
                        });
                    }

                    await this.context.globalState.update('folderColors', entries);
                    this.onUpdate?.();
                    updateWebview();
                    break;

                case 'deleteEntry':
                    if (message.index >= 0 && message.index < entries.length) {
                        entries.splice(message.index, 1);
                        await this.context.globalState.update('folderColors', entries);
                        this.onUpdate?.();
                        updateWebview();
                    }
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
            'foldercolors_red_orange': '#FF5733',
            'foldercolors_red': '#FF0000',
            'foldercolors_hot_pink': '#FF69B4',
            'foldercolors_yellow': '#FFC300',
            'foldercolors_lemon_yellow': '#FFFF00',
            'foldercolors_lime_green': '#75FF33',
            'foldercolors_green': '#008000',
            'foldercolors_turquoise': '#00CED1',
            'foldercolors_sky_blue': '#33C1FF',
            'foldercolors_vs_code_blue': '#007ACC',
            'foldercolors_blue': '#0000FF',
            'foldercolors_indigo': '#4B0082',
            'foldercolors_purple': '#800080',
            'foldercolors_violet': '#C700FF',
            'foldercolors_magenta': '#FF33A6',
            'foldercolors_white': '#FFFFFF',
            'foldercolors_light_gray': '#D3D3D3',
            'foldercolors_gray': '#888888',
            'foldercolors_dark_gray': '#444444',
            'foldercolors_black': '#000000'
        };

        return colorMap[color] || '#000000';
    }

    private getHtml(entries: any[]): string {
        const rows = entries.map((entry, index) => `
            <tr>
                <td>${entry.foldername}</td>
                <td>
                    <div style="background-color:${this.getHexColor(entry.color)}; width: 10px; height: 10px; border-radius: 10px; display: inline-block;"></div>
                </td>
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

        return `<!DOCTYPE html>
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
                        color: white;
                    }
                </style>
            </head>
            <body>
                <h2>Folder Color Settings</h2>
                <label>Folder Name</label>
                <input id="foldername" type="text" />

                <label>Color</label>
                <select id="color">
                    <option style="color: #FF5733" value="foldercolors_red_orange">Red Orange</option>
                    <option style="color: #FF0000" value="foldercolors_red">Red</option>
                    <option style="color: #FF69B4" value="foldercolors_hot_pink">Hot Pink</option>
                    <option style="color: #FFC300" value="foldercolors_yellow">Yellow</option>
                    <option style="color: #FFFF00" value="foldercolors_lemon_yellow">Lemon Yellow</option>
                    <option style="color: #75FF33" value="foldercolors_lime_green">Lime Green</option>
                    <option style="color: #008000" value="foldercolors_green">Green</option>
                    <option style="color: #00CED1" value="foldercolors_turquoise">Turquoise</option>
                    <option style="color: #33C1FF" value="foldercolors_sky_blue">Sky Blue</option>
                    <option style="color: #007ACC" value="foldercolors_vs_code_blue">VS Code Blue</option>
                    <option style="color: #0000FF" value="foldercolors_blue">Blue</option>
                    <option style="color: #4B0082" value="foldercolors_indigo">Indigo</option>
                    <option style="color: #800080" value="foldercolors_purple">Purple</option>
                    <option style="color: #C700FF" value="foldercolors_violet">Violet</option>
                    <option style="color: #FF33A6" value="foldercolors_magenta">Magenta</option>
                    <option style="color: #FFFFFF" value="foldercolors_white">White</option>
                    <option style="color: #D3D3D3" value="foldercolors_light_gray">Light Gray</option>
                    <option style="color: #888888" value="foldercolors_gray">Gray</option>
                    <option style="color: #444444" value="foldercolors_dark_gray">Dark Gray</option>
                    <option style="color: #000000" value="foldercolors_black">Black</option>
                </select>

                <input type="hidden" id="editIndex" />
                <button onclick="save()">Save</button>

                <table>
                    <thead>
                        <tr>
                            <th>Folder Name</th>
                            <th>Color</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>

                <script>
                    const vscode = acquireVsCodeApi();

                    function save() {
                        const foldername = document.getElementById('foldername').value;
                        const color = document.getElementById('color').value;
                        const editIndex = document.getElementById('editIndex').value;

                        vscode.postMessage({
                            command: 'saveEntry',
                            foldername,
                            color,
                            editIndex: editIndex ? parseInt(editIndex) : undefined
                        });

                        clearForm();
                    }

                    function edit(index) {
                        const row = document.querySelectorAll("tbody tr")[index * 2];
                        const cells = row.getElementsByTagName("td");

                        document.getElementById('foldername').value = cells[0].innerText;
                        document.getElementById('color').value = entries[index].color;
                        document.getElementById('editIndex').value = index;
                    }

                    function del(index) {
                        vscode.postMessage({ command: 'deleteEntry', index });
                    }

                    function clearForm() {
                        document.getElementById('foldername').value = '';
                        document.getElementById('color').selectedIndex = 0;
                        document.getElementById('editIndex').value = '';
                    }
                </script>
            </body>
            </html>`;
    }
}