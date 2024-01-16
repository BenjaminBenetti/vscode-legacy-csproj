import * as vscode from "vscode";
import AbstractEventListener from "./abstract-event-listener";
import CsprojService from "../../csproj/csproj-service";
import { logger } from "../../logger";
import path from "path";

export default class FileCreatedListener extends AbstractEventListener {
  // ========================================================
  // public methods
  // ========================================================

  // listen for events
  public bind(): void {
    this.disposable = vscode.workspace.onDidCreateFiles(
      async (fileEvent: vscode.FileCreateEvent) => {
        this.addFiles(fileEvent.files);
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

  // ========================================================
  // private methods
  // ========================================================

  /**
   * add the given files to the csproj
   * @param files - the files to add
   */
  private async addFiles(files: readonly vscode.Uri[]): Promise<void> {
    try {
      const csprojService = new CsprojService(true);
      await this.recursiveAddFiles(files, csprojService);
      csprojService.flush();
    } catch (error) {
      logger.error(`Unexpected error while adding files ${error}`);
    }
  }

  /**
   * recursively add the given files to the csproj
   * @param files - the files to add
   * @param csprojService - the csproj service to use
   */
  private async recursiveAddFiles(
    files: readonly vscode.Uri[],
    csprojService: CsprojService,
  ) {
    for (const file of files) {
      switch ((await vscode.workspace.fs.stat(file)).type) {
        case vscode.FileType.File:
          await csprojService.addFileToCsproj(file.fsPath);
          break;
        case vscode.FileType.Directory:
          await this.recursiveAddFiles(
            (await vscode.workspace.fs.readDirectory(file)).map((fl) =>
              vscode.Uri.file(path.join(file.fsPath, fl[0])),
            ),
            csprojService,
          );
          break;
      }
    }
  }
}
