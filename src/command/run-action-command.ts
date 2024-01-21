import { ExtensionContext, commands, window } from "vscode";
import AbstractCommand from "./abstract-command";
import { logger } from "../logger";
import CsprojService from "../csproj/csproj-service";
import path from "path";
import LegacyCsprojService from "../legacy-csproj/legacy-csproj-service";
import CsprojInclusionIndicator from "../ui/status-bar/csproj-inclusion-indicator";
import { Command } from "./command";

export default class RunActionCommand extends AbstractCommand {
  // ========================================================
  // public methods
  // ========================================================

  public constructor(
    private _csprojInclusionIndicator: CsprojInclusionIndicator,
    extensionContext: ExtensionContext,
  ) {
    super(extensionContext);
  }

  public bind(): void {
    this._disposable = commands.registerCommand(Command.RunAction, async () => {
      await this.runAction();
      this._csprojInclusionIndicator.updateIndicator();
    });

    logger.info("Run action command bound");

    this.extensionContext.subscriptions.push(this._disposable);
  }

  // ========================================================
  // private methods
  // ========================================================

  /**
   * let the user select witch action to run and run it.
   */
  private async runAction(): Promise<void> {
    const legacyCsprojService = new LegacyCsprojService();
    const csprojService = new CsprojService();
    const activeFile = window.activeTextEditor?.document.uri;
    const csproj = activeFile
      ? await csprojService.findNearestCsproj(activeFile.fsPath)
      : null;

    if (activeFile && csproj) {
      const addOption = `✅ Add to ${path.basename(csproj)}`;
      const removeOption = `❌ Remove from ${path.basename(csproj)}`;
      const userSelection = await window.showQuickPick([
        addOption,
        removeOption,
      ]);

      if (userSelection) {
        switch (userSelection) {
          case addOption:
            await legacyCsprojService.addFilesToProject([activeFile]);
            break;
          case removeOption:
            await legacyCsprojService.removeFilesFromProject([activeFile]);
            break;
        }
      }
    } else if (!activeFile) {
      window.showInformationMessage("No active file. Select a file first.");
    } else {
      window.showInformationMessage(
        "No csproj found. Make sure there is a csproj in the active files folder or any of its parents",
      );
    }
  }
}
