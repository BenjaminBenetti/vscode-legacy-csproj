import * as vscode from "vscode";
import AbstractEventListener from "./abstract-event-listener";
import { logger } from "../../logger";
import LegacyCsprojService from "../../legacy-csproj/legacy-csproj-service";

export default class FileCreatedListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    const legacyCsprojService = new LegacyCsprojService();

    this.disposable = vscode.workspace.onDidCreateFiles(
      async (fileEvent: vscode.FileCreateEvent) => {
        legacyCsprojService.addFilesToProject(fileEvent.files);
      },
    );

    // auto cleanup when extension is deactivated
    this.extensionContext.subscriptions.push(this.disposable);

    logger.info("File created listener bound");
  }

  // stop listening for events
  public unbind(): void {
    this.disposable?.dispose();
  }
}
