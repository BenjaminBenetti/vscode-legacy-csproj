import { ExtensionContext, Uri, commands } from "vscode";
import AbstractCommand from "./abstract-command";
import { Command } from "./command";
import { logger } from "../logger";
import CsprojInclusionIndicator from "../ui/status-bar/csproj-inclusion-indicator";
import LegacyCsprojService from "../legacy-csproj/legacy-csproj-service";

export default class RemoveFileCommand extends AbstractCommand {
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
    const legacyCsprojService = new LegacyCsprojService();

    this._disposable = commands.registerCommand(
      Command.RemoveFile,
      async (file: Uri) => {
        await legacyCsprojService.removeFilesFromProject([file]);
        this._csprojInclusionIndicator.updateIndicator();
      },
    );

    logger.info("Remove file command bound");

    this.extensionContext.subscriptions.push(this._disposable);
  }
}
