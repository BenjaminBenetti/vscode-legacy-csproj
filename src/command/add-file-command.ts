import { ExtensionContext, Uri, commands } from "vscode";
import AbstractCommand from "./abstract-command";
import { Command } from "./command";
import { logger } from "../logger";
import CsprojInclusionIndicator from "../ui/status-bar/csproj-inclusion-indicator";
import LegacyCsprojService from "../legacy-csproj/legacy-csproj-service";

export default class AddFileCommand extends AbstractCommand {
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
      Command.AddFile,
      async (file: Uri) => {
        await legacyCsprojService.addFilesToProject([file]);
        this._csprojInclusionIndicator.updateIndicator();
      },
    );

    logger.info("Add file command bound");

    this.extensionContext.subscriptions.push(this._disposable);
  }
}
