import path from "path";
import CsprojService from "../../csproj/csproj-service";
import AbstractEventListener from "./abstract-event-listener";
import * as vscode from "vscode";

export default class FileDeleteListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    this.disposable = vscode.workspace.onWillDeleteFiles(
      async (fileDeleteEvent: vscode.FileWillDeleteEvent) => {
        fileDeleteEvent.waitUntil(this.recursiveRemove(fileDeleteEvent.files));
      },
    );

    // auto cleanup when extension is deactivated
    this.extensionContext.subscriptions.push(this.disposable);
  }

  // stop listening for events
  public unbind(): void {
    this.disposable?.dispose();
  }

  // ========================================================
  // private methods
  // ========================================================

  private async recursiveRemove(files: readonly vscode.Uri[]): Promise<void> {
    for (const file of files) {
      const fileStat = await vscode.workspace.fs.stat(file);

      if (fileStat.type === vscode.FileType.File) {
        await new CsprojService().removeFileFromCsproj(file.fsPath);
      } else if (fileStat.type === vscode.FileType.Directory) {
        const files = await vscode.workspace.fs.readDirectory(file);

        await this.recursiveRemove(
          files.map((fl) => vscode.Uri.parse(path.join(file.fsPath, fl[0]))),
        );
      }
    }
  }
}
