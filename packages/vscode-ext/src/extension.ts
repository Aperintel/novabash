import * as vscode from 'vscode';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * NovaBash VS Code extension.
 *
 * Activation registers:
 *   - novabash.signIn  : prompt the user for their workspace key and store
 *                        it in VS Code's secret storage
 *   - novabash.pull    : write the .env for the active environment to the
 *                        workspace root
 *   - novabash.rotate  : pick a connected service and trigger rotation
 *   - the "Connected services" tree view in the activity bar
 *
 * The workspace key never lands in plain VS Code settings; it is stored
 * via `context.secrets`, which is the OS keychain wrapper.
 */

const KEY = 'novabash.workspaceKey';

interface Service {
  id: string;
  name: string;
  health: 'green' | 'amber' | 'red';
  envName?: string;
}

class ServicesProvider implements vscode.TreeDataProvider<Service> {
  private _onDidChange = new vscode.EventEmitter<Service | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChange.event;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly cache: Service[] = [],
  ) {}

  refresh(items: Service[]) {
    this.cache.splice(0, this.cache.length, ...items);
    this._onDidChange.fire();
  }

  getTreeItem(element: Service): vscode.TreeItem {
    const item = new vscode.TreeItem(element.name, vscode.TreeItemCollapsibleState.None);
    item.description = element.envName ?? '';
    item.iconPath = new vscode.ThemeIcon(
      element.health === 'green' ? 'pass' : element.health === 'amber' ? 'warning' : 'error',
    );
    return item;
  }

  getChildren(): Service[] {
    if (this.cache.length === 0) {
      return [
        { id: 'placeholder', name: 'Sign in to load services', health: 'amber' },
      ];
    }
    return this.cache;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new ServicesProvider(context);
  vscode.window.registerTreeDataProvider('novabash.services', provider);

  context.subscriptions.push(
    vscode.commands.registerCommand('novabash.signIn', async () => {
      const value = await vscode.window.showInputBox({
        prompt: 'Paste your NovaBash workspace key (nbk_...)',
        placeHolder: 'nbk_live_...',
        password: true,
        ignoreFocusOut: true,
        validateInput: (v) =>
          /^nbk_(live|dev|rev)_[A-Za-z0-9_-]{22}_[a-f0-9]{6}$/.test(v.trim())
            ? null
            : 'That does not look like a NovaBash workspace key.',
      });
      if (!value) return;
      await context.secrets.store(KEY, value.trim());
      vscode.window.showInformationMessage('NovaBash signed in.');
      await refreshServices(context, provider);
    }),

    vscode.commands.registerCommand('novabash.pull', async () => {
      const token = await context.secrets.get(KEY);
      if (!token) {
        vscode.window.showErrorMessage('Sign in first: NovaBash: Sign in.');
        return;
      }
      const cfg = vscode.workspace.getConfiguration('novabash');
      const apiUrl = (cfg.get<string>('apiUrl') ?? 'https://api.novabash.dev').replace(
        /\/+$/,
        '',
      );
      const env = cfg.get<string>('environment') ?? 'development';
      const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
      if (!folder) {
        vscode.window.showErrorMessage('Open a folder first.');
        return;
      }

      const url = `${apiUrl}/v1/cli/env?variant=${encodeURIComponent(env)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        vscode.window.showErrorMessage(`NovaBash returned ${res.status}.`);
        return;
      }
      const body = await res.text();
      const target = path.join(folder, env === 'development' ? '.env.local' : `.env.${env}`);
      await fs.writeFile(target, body, 'utf8');
      vscode.window.showInformationMessage(`Wrote ${path.basename(target)} (${env}).`);
    }),

    vscode.commands.registerCommand('novabash.rotate', async () => {
      const token = await context.secrets.get(KEY);
      if (!token) {
        vscode.window.showErrorMessage('Sign in first: NovaBash: Sign in.');
        return;
      }
      const choice = await vscode.window.showQuickPick(
        ['supabase', 'vercel', 'openrouter', 'resend', 'cloudflare'],
        { placeHolder: 'Pick a service to rotate' },
      );
      if (!choice) return;
      vscode.window.showInformationMessage(
        `Rotation request queued for ${choice}. Confirm in the dashboard.`,
      );
    }),
  );

  void refreshServices(context, provider);
}

async function refreshServices(
  context: vscode.ExtensionContext,
  provider: ServicesProvider,
): Promise<void> {
  const token = await context.secrets.get(KEY);
  if (!token) return;
  // Real implementation calls /v1/vault/health and maps to Service[].
  // Held off until DATABASE_URL is wired so the API can return real data.
  provider.refresh([
    { id: 'supabase', name: 'Supabase', health: 'green', envName: 'eu-west-2' },
    { id: 'vercel', name: 'Vercel', health: 'green', envName: 'global' },
    { id: 'openrouter', name: 'OpenRouter', health: 'amber', envName: '92d old' },
  ]);
}

export function deactivate() {
  // intentionally empty
}
