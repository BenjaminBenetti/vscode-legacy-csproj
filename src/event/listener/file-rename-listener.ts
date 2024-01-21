import path from "path";
import CsprojService from "../../csproj/csproj-service";
import AbstractEventListener from "./abstract-event-listener";
import * as vscode from "vscode";
import { logger } from "../../logger";
import LegacyCsprojService from "../../legacy-csproj/legacy-csproj-service";

export default class FileRenameListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    const legacyCsprojService = new LegacyCsprojService();

    this.disposable = vscode.workspace.onWillRenameFiles(
      async (fileRenameEvent: vscode.FileWillRenameEvent) => {
        fileRenameEvent.waitUntil(
          legacyCsprojService.renameProjectFiles(fileRenameEvent.files),
        );
      },
    );

    // auto cleanup when extension is deactivated
    this.extensionContext.subscriptions.push(this.disposable);

    logger.info("File rename listener bound");
  }

  // stop listening for events
  public unbind(): void {
    this.disposable?.dispose();
  }
}
