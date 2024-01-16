import path from "path";
import CsprojService from "../../csproj/csproj-service";
import AbstractEventListener from "./abstract-event-listener";
import * as vscode from "vscode";
import { logger } from "../../logger";

export default class FileRenameListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    this.disposable = vscode.workspace.onWillRenameFiles(
      async (fileRenameEvent: vscode.FileWillRenameEvent) => {
        fileRenameEvent.waitUntil(this.renameFiles(fileRenameEvent.files));
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

  // ========================================================
  // private methods
  // ========================================================

  /**
   * Rename the given files in the csproj
   * @param files - the files to rename
   */
  private async renameFiles(
    files: readonly { oldUri: vscode.Uri; newUri: vscode.Uri }[],
  ): Promise<void> {
    try {
      await this.recursiveRename(files);
    } catch (error) {
      logger.error(`Unexpected error while renaming files ${error}`);
    }
  }

  private async recursiveRename(
    files: readonly { oldUri: vscode.Uri; newUri: vscode.Uri }[],
  ): Promise<void> {
    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(file.oldUri);

      if (fileStat.type === vscode.FileType.File) {
        await new CsprojService().removeFileFromCsproj(file.oldUri.fsPath);
        await new CsprojService().addFileToCsproj(file.newUri.fsPath);
      } else if (fileStat.type === vscode.FileType.Directory) {
        const files = await vscode.workspace.fs.readDirectory(file.oldUri);

        await this.recursiveRename(
          files.map((fl) => ({
            oldUri: vscode.Uri.parse(path.join(file.oldUri.fsPath, fl[0])),
            newUri: vscode.Uri.parse(path.join(file.newUri.fsPath, fl[0])),
          })),
        );
      }
    }
  }
}
