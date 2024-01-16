import path from "path";
import CsprojService from "../../csproj/csproj-service";
import AbstractEventListener from "./abstract-event-listener";
import * as vscode from "vscode";
import { logger } from "../../logger";

export default class FileDeleteListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    this.disposable = vscode.workspace.onWillDeleteFiles(
      async (fileDeleteEvent: vscode.FileWillDeleteEvent) => {
        fileDeleteEvent.waitUntil(this.removeFiles(fileDeleteEvent.files));
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

  // ========================================================
  // private methods
  // ========================================================

  private async removeFiles(files: readonly vscode.Uri[]): Promise<void> {
    try {
      const csprojService = new CsprojService(true);
      await this.recursiveRemove(files, csprojService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while deleting files ${error}`);
    }
  }

  private async recursiveRemove(
    files: readonly vscode.Uri[],
    csprojService: CsprojService,
  ): Promise<void> {
    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(file);

      if (fileStat.type === vscode.FileType.File) {
        await csprojService.removeFileFromCsproj(file.fsPath);
      } else if (fileStat.type === vscode.FileType.Directory) {
        const files = await vscode.workspace.fs.readDirectory(file);

        await this.recursiveRemove(
          files.map((fl) => vscode.Uri.file(path.join(file.fsPath, fl[0]))),
          csprojService,
        );
      }
    }
  }
}
