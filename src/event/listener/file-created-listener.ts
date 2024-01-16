import * as vscode from "vscode";
import AbstractEventListener from "./abstract-event-listener";
import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";

export default class FileCreatedListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    this.disposable = vscode.workspace.onDidCreateFiles(
      async (fileEvent: vscode.FileCreateEvent) => {
        const csprojService = new CsprojService();

        try {
          for (const file of fileEvent.files) {
            if (
              (await vscode.workspace.fs.stat(file)).type ===
              vscode.FileType.File
            ) {
              await csprojService.addFileToCsproj(file.fsPath);
            }
          }
        } catch (error) {
          logger.error(`Unexpected error while adding files ${error}`);
        }
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
