import path from "path";
import CsprojService from "../../csproj/csproj-service";
import AbstractEventListener from "./abstract-event-listener";
import * as vscode from "vscode";
import { logger } from "../../logger";
import LegacyCsprojService from "../../legacy-csproj/legacy-csproj-service";

export default class FileDeleteListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    const legacyCsprojService = new LegacyCsprojService();

    this.disposable = vscode.workspace.onWillDeleteFiles(
      async (fileDeleteEvent: vscode.FileWillDeleteEvent) => {
        fileDeleteEvent.waitUntil(
          legacyCsprojService.removeFilesFromProject(fileDeleteEvent.files),
        );
      },
    );

    // auto cleanup when extension is deactivated
    this.extensionContext.subscriptions.push(this.disposable);

    logger.info("File delete listener bound");
  }

  // stop listening for events
  public unbind(): void {
    this.disposable?.dispose();
  }
}
