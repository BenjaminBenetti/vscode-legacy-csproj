import vscode from "vscode";
import CsprojService from "../../csproj/csproj-service";
import path from "path";
import { Command } from "../../command/command";

export default class CsprojInclusionIndicator {
  private _statusBarItem: vscode.StatusBarItem;

  // ========================================================
  // public methods
  // ========================================================

  public constructor() {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
    );
    this._statusBarItem.command = Command.RunAction;
    this.hide();
  }

  /**
   * update the status indicator
   */
  public async updateIndicator(): Promise<void> {
    const csprojService = new CsprojService();
    const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;

    if (activeFile) {
      const csprojFile = await csprojService.findNearestCsproj(activeFile);

      if ((await csprojService.isFileInCsproj(activeFile)) && csprojFile) {
        this._statusBarItem.text = `✅ ${path.basename(csprojFile)}`;
        this._statusBarItem.tooltip = `The currently open file is in the csproj (${path.basename(csprojFile)})`;
        this.show();
      } else if (csprojFile) {
        this._statusBarItem.text = `❌ Not in csproj`;
        this._statusBarItem.tooltip =
          "The currently open file is NOT in a csproj";
        this.show();
      } else {
        this.hide();
      }
    } else {
      this.hide();
    }
  }

  public dispose(): void {
    this._statusBarItem.dispose();
  }

  public show() {
    this._statusBarItem.show();
  }

  public hide() {
    this._statusBarItem.hide();
  }
}
